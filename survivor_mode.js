const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

function game_update(){
	ctx.fillStyle = '#FFFFFF'
	ctx.fillRect(0,0,canvas.width,canvas.height)
}

let fps = 60

let player = new Player(canvas.width/2,canvas.height/2+50)

let floors = new areaGenerate(canvas.width/2,canvas.height/2, 10, 10,"assets\\main\\floor.png",80)
floors.player = player
floors.append({x: 0, y: 0, img: "assets\\main\\light.png"})

for(let i=3; i<9; i++){
floors.obstacle_append(i,1)
floors.obstacle_append(i,2)
floors.obstacle_append(i,3)
floors.obstacle_append(i,4)
}
//floors.define_agent(0,floors.area.list[[1,5]][0], floors.area.list[[1,5]][1])

let light = new backgroundElement(canvas.width/2, canvas.height/2,250, "assets\\main\\light.png")

function animate(){
	setTimeout(() => {
    	window.requestAnimationFrame(animate)
  	}, 1000 / fps)
	
  	game_update()

  	floors.update()

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