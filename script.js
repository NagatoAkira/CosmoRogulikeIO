const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

function game_update(){
	//let default = '#00132F'
	ctx.fillStyle = '#00132F'
	ctx.fillRect(0,0,canvas.width,canvas.height)
}

class Camera{
	constructor(player, gameMap, other){
		this.x = 0 // Camera position relative to other objects's one
		this.y = 0

		this.player = player
		this.gameMap = gameMap

		this.speed = 0
	}

	dist_func(x1,y1,x2,y2){
		let vector = [x2-x1, y2-y1]
		return Math.sqrt(vector[0]**2+vector[1]**2)
	}

	player_chase(){
		let distance = this.dist_func(canvas.width/2-this.player.scale/2, canvas.height/2-this.player.scale/2, 
									  this.player.x+this.player.scale/2, this.player.y+this.player.scale/2)

		if(distance > 150){
			this.speed = 1
		}else{
			this.speed = 0
		}
		this.x = -this.player.velocity.x * this.player.speed*0.67 * this.speed
		this.y = -this.player.velocity.y * this.player.speed*0.67 * this.speed
	}

	move(){
		if(this.player.x < 0 ){
			this.x = canvas.width
		}
		if(this.player.x > canvas.width){
			this.x = -canvas.width
		}
		if(this.player.y < 0 ){
			this.y = canvas.height
		}
		if(this.player.y > canvas.height){
			this.y = -canvas.height
		}
	}

	rooms_func(){
		for(let i in this.gameMap.rooms){
			for(let b in this.gameMap.rooms[i].layers[0]){ // brick
				this.gameMap.rooms[i].layers[0][b].x += this.x
				this.gameMap.rooms[i].layers[0][b].y += this.y
			}
			for(let spc in this.gameMap.rooms[i].inner_space.list){ // inner room space slots
				this.gameMap.rooms[i].inner_space.list[spc].x += this.x
				this.gameMap.rooms[i].inner_space.list[spc].y += this.y
			}
			for(let path_spc in this.gameMap.rooms[i].inner_space.pathList){
				this.gameMap.rooms[i].inner_space.pathList[path_spc].x += this.x
				this.gameMap.rooms[i].inner_space.pathList[path_spc].y += this.y
			}
		}
	}

	area_func(){
		for(let r in this.gameMap.pathFinderList){
			let room = this.gameMap.pathFinderList[r]
			room.x += this.x
			room.y += this.y
			let floor = this.gameMap.pathFinderList[r].area.list
			for(let b in floor){
				floor[b][0] += this.x
				floor[b][1] += this.y
			}

			let agents = this.gameMap.pathFinderList[r].pathFinder

			for(let a in agents){
				agents[a].agent.x_ += this.x
				agents[a].agent.y_ += this.y
			}
			
		}
	}

	player_func(){
		this.player.x += this.x*1.5
		this.player.y += this.y*1.5
	}

	lock_move(){
		this.x = 0
		this.y = 0
	}
	update(){
		this.move()
		this.player_chase()
		this.area_func()
		this.rooms_func()
		this.player_func()
		//this.lock_move()
	}
}

class Pyramid{
	constructor(gameMap, pathFinderIndex, agentIndex, player){
		this.gameMap = gameMap
		this.pathIndex = pathFinderIndex
		this.agentIndex = agentIndex 
		this.player = player

		this.x = 0
		this.y = 0

		this.img = new Image
		this.img.src = "assets\\main\\monster.png"

		this.scale = 150

		this.hp = 4
	}
	dist_func(x1,y1,x2,y2){
		let vector = [x2-x1, y2-y1]
		return Math.sqrt(vector[0]**2+vector[1]**2)
	}
	reflect(){
		let orientation = Math.atan2(this.player.x - this.x+this.scale/2, this.player.y - this.y+this.scale/2)

		if(orientation > 0){
			this.img.src = "assets\\main\\reflect_monster.png"
		}else{
			this.img.src = "assets\\main\\monster.png"
		}
	}
	checkDamage(){
		for(let index in this.player.bullets){
			let bullet = this.player.bullets[index]
			if(this.dist_func(this.x+this.scale/2, this.y+this.scale/2, bullet.x, bullet.y) < 55){
				this.player.delete_bullet(index)
				this.hp -= 1
			}
		}
	}
	isDead(){
		if(this.hp < 1){	
			return false
		}
		return true
	}
	isMove(bool){
		this.gameMap.pathFinderList[this.pathIndex].pathFinder[this.agentIndex].isMove = bool
	}
	stopMove(){
		if(this.dist_func(this.x+this.scale/2, this.y+this.scale/2, this.player.x+this.player.scale/2, this.player.y+this.player.scale/2) > 145){
			this.isMove(true)
		}else{
			this.isMove(false)
		}
	}
	attackPlayer(){
		let isMove = this.gameMap.pathFinderList[this.pathIndex].pathFinder[this.agentIndex].isMove
		if(!isMove){
			this.player.hp -= 0.5
		}
	}
	deleteEnemy(){
		delete this.gameMap.pathFinderList[this.pathIndex].pathFinder[this.agentIndex]
	}
	draw(){
		ctx.drawImage(this.img, this.x, this.y, this.scale, this.scale)
	}
	move(){
		this.x = this.gameMap.pathFinderList[this.pathIndex].pathFinder[this.agentIndex].agent.x_
		this.y = this.gameMap.pathFinderList[this.pathIndex].pathFinder[this.agentIndex].agent.y_
	}
	update(){
		console.log(this.player.hp)
		if(this.isDead()){
		this.reflect()
		this.attackPlayer()
		this.stopMove()
		this.checkDamage()
		this.move()
		this.draw()
		}
		else{
			this.deleteEnemy()
		}
	}
}

let fps = 60

let player = new Player(canvas.width/2-75,canvas.height/2-75)

let game_map = new Location()
game_map.init(new Room(canvas.width/2,canvas.height/2,10,15,90),player)
game_map.generate(9)


let enemy = new Pyramid(game_map, 0, 0, player)

let camera = new Camera(player, game_map)

function animate(){
	setTimeout(() => {
    	window.requestAnimationFrame(animate);
  	}, 1000 / fps)
	
  	game_update()

  	game_map.update()

  	player.update()

  	enemy.update()

  	for(let index in game_map.collisionList){
  		game_map.collisionList[index].update()
  	}

  	camera.update()

  	lock_movement()
}

function lock_movement(){
	if(!(map[65] || map[68])){
  		player.velocity.x = 0
  	}
  	if(!(map[87] || map[83])){
  		player.velocity.y = 0
  	}
}

window.addEventListener('click', function(event){
	player.shoot()
})


window.addEventListener('mousemove', function(event){
	player.mouse_pos = [event.clientX, event.clientY]
})



var key_code = {left: 65,
				up: 87,
				right: 68,
				down: 83}
var map = {65: false,
		   87: false,
		   68: false,
		   83: false}
onkeydown = onkeyup = function(e){
	if(e.keyCode in map){
    map[e.keyCode] = e.type == 'keydown';
	}

    for (let key in map){
    	if(key_code.left==key && map[key]){
    		player.velocity.x = -1
    	}
    	else if(key_code.right==key && map[key]){
    		player.velocity.x = 1
    	}
    	if(key_code.up==key && map[key]){
    		player.velocity.y = -1
    	}
    	else if(key_code.down==key && map[key]){
    		player.velocity.y = 1
    	}

    }
}

animate()