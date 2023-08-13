class pathFind2d{
	constructor(height,width,matrix,brick_scale,agent,aim){
		this.area = {scale:{height: height, width: width}, 
					 list:matrix}

		this.brick_scale = brick_scale

		this.agent = {x: agent.x!=null ? agent.x:0,
					  y: agent.y!=null ? agent.y:0, 
					  x_: 0,
					  y_: 0, 
					  img: new Image,
					  scale: agent.scale!= null ? agent.scale:this.brick_scale}


		let abs_agent_pos = this.area.list[[this.agent.x, this.agent.y]]
		this.agent.x_ = abs_agent_pos[0]
		this.agent.y_ = abs_agent_pos[1] 

		this.agent.img.src = agent.img

		this.aim = {x: aim.x!=null ? aim.x:0,
					y: aim.y!=null ? aim.y:0,
					img: new Image,
					scale: aim.scale!= null ? aim.scale:this.brick_scale}
		this.aim.img.src = aim.img

		this.path = []

		this.obstacles = {}

		this.isMove = true
	}
	normalize(x1,y1,x2,y2){
		let distance = this.dist_func(x1,y1,x2,y2)
		let vector = [x2-x1, y2-y1]
		return [vector[0]/distance, vector[1]/distance]
	}
	agent_move(){
		if (this.path[1] != null){
		let area = this.area.list
		let startPath = this.path[1]
		let endPath = this.path[this.path.length-1]

		if (!(startPath[0] == this.aim.x && startPath[1] == this.aim.y)){
			
			let dir = this.normalize(this.agent.x_, this.agent.y_, startPath[0], startPath[1])
			
			if(this.isMove){
			this.agent.x_ += dir[0]
			this.agent.y_ += dir[1]
			this.define_agent(this.agent.x_, this.agent.y_)
			}
		}
	  }
	}
	draw_agent(){
		let x = this.agent.x_ + this.brick_scale/2
		let y = this.agent.y_ + this.brick_scale/2
		ctx.drawImage(this.agent.img, 
					  x, y, 
					  this.agent.scale,this.agent.scale)
	}
	dist_func(x1,y1,x2,y2){
		let vector = [x2-x1, y2-y1]
		return Math.sqrt(vector[0]**2+vector[1]**2)
	}
	create_path(){
		let x1 = this.agent.x
		let y1 = this.agent.y

		let x2 = this.aim.x
		let y2 = this.aim.y

		let path = [[x1,y1]]
		let dist = this.dist_func(x1, y1, x2, y2)

		function cancel_return_path(path,x,y){
			let len = path.length
			let max = 2

			for (let i=len>max ? len-max:0; i<len; i++){
				if(path[i][0] == x && path[i][1]==y){
					return false
				}
			}
			return true
		}

		//let max = this.area.scale.height > this.area.scale.width ? this.area.scale.height:this.area.scale.width
		let max = Math.floor(this.area.scale.height*(this.area.scale.width/2))

		for(let i=0; i<max; i++){

		// Generate nine available paths with one step
		if(x1==x2 && y1==y2){
			break
		}
			
		let next_dir = []

		for(let x=-1; x<2; x++){
			for(let y=-1; y<2; y++){
		
				if(!(x == 0 && y == 0)){

					let obstacles = this.obstacles[[x1+x, y1+y]]
					obstacles  = obstacles!=null ? obstacles:[]

					if(!(obstacles[0] == x1+x && obstacles[1] == y1+y)){

						if(cancel_return_path(path, x1+x, y1+y)){
							let _dist = this.dist_func(x1+x, y1+y, x2, y2)
							next_dir.push([x,y,_dist])
						}
					}
				}
			}
		}
		if(next_dir[0]==null){
			break
		}

		// From nine we choose the most nearby to goal		
		let iter_dist = next_dir[0][2]
		let iter_next_dir = []

		for(let index in next_dir){
		if(iter_dist>=next_dir[index][2]){
		iter_dist = next_dir[index][2]
		iter_next_dir = [next_dir[index][0], next_dir[index][1]]
		}
		}
		next_dir = iter_next_dir
		

		if(dist > 0){
			x1 += next_dir[0]
			y1 += next_dir[1]
			path.push([x1,y1])
		}else{
			x1 += next_dir[0]
			y1 += next_dir[1]
			path.push([x1,y1])
			break
		}
		}

		return path
	}
	decrypted_path(){
		let path = this.create_path()
		let depath = []
		let start = this.area.list[[0, 0]]
		for(let index in path){
			let x1 = path[index][0] * this.brick_scale + start[0]
			let y1 = path[index][1] * this.brick_scale + start[1]
			depath.push([x1,y1])
		}
		return depath
	}
	gizmos_line(){
		this.path = this.decrypted_path()
		let path = this.path 

		ctx.beginPath()
		for(let i=1; i<path.length; i++){
			ctx.moveTo(path[i-1][0]+this.brick_scale, path[i-1][1]+this.brick_scale)
			ctx.lineTo(path[i][0]+this.brick_scale, path[i][1]+this.brick_scale)
		}
		ctx.lineWidth = 10
		ctx.lineCap = "round"
		ctx.stroke()
	}
	define_agent(x,y){
		let result = []

		for(let index in this.area.list){
			let brick = this.area.list[index]
			if(brick[0]-this.brick_scale*0.5 <= x && 
			   brick[0]+this.brick_scale*0.5 >= x &&
			   brick[1]-this.brick_scale*0.5 <= y && 
			   brick[1]+this.brick_scale*0.5 >= y){
				result = index
			}
		}
		
		let num = ''
		let res = []		
		for(let i in result){
			if(result[i]!=','){
				num += result[i]
			}else{
				res.push(parseInt(num))
				num = ''
			}
		}
		res.push(parseInt(num))
		result = res

		if(result.length == 2){
		this.agent.x = result[0]
		this.agent.y = result[1]
		}
	}
}

class areaGenerate{
	constructor(x,y, height, width, brick_asset,brick_scale,player){
		this.x = x
		this.y = y

		this.area = {scale:{height: height, width: width}, 
					 list:{}}

		this.brick_scale = brick_scale==null ? 90:brick_scale

		this.brick_img = new Image()
		this.brick_img.src = brick_asset

		this.matrix()

		this.aim = {x: 10, y: 2, img: "assets\\main\\light.png"}

		this.pathFinder = []

		this.player = player

		this.obstacle_area = {list:[]}
	}
	obstacle_append(x,y){
		this.obstacle_area.list.push(this.area.list[[x,y]])
		for(let index in this.pathFinder){
			this.pathFinder[index].obstacles[[x,y]] = [x,y]
		}
	}
	append(agent){
		this.pathFinder.push(new pathFind2d(this.area.scale.height,this.area.scale.height,
											this.area.list,this.brick_scale,agent,this.aim))
	}
	draw_agent(){
		for(let index in this.pathFinder){
			this.pathFinder[index].draw_agent()
		}
	}
	agent_move(){
		for(let index in this.pathFinder){
			this.pathFinder[index].agent_move()
		}
	}
	gizmos_line(){
		for(let index in this.pathFinder){
			this.pathFinder[index].gizmos_line()
		}
	}
	gizmos_object(x,y){
		ctx.fillStyle = '#000000'
		let size = 50
		let pos = this.area.list[[x, y]]
		ctx.rect(pos[0]+this.brick_scale-size/2,pos[1]+this.brick_scale-size/2,size,size)
		ctx.fill()
	}
	matrix(){
		let height = Math.floor(this.area.scale.height/2)
		let width = Math.floor(this.area.scale.width/2)
		for(let x=-width; x<width; x++){
			for(let y=-height; y<height; y++){
				this.area.list[[x+width, y+height]] = [this.x+this.brick_scale*x, this.y+this.brick_scale*y]
			}
		}
	}
	gizmos_brick(x,y){
		ctx.drawImage(this.brick_img, x+this.brick_scale/2, y+this.brick_scale/2, this.brick_scale, this.brick_scale)
	}
	draw_area(){
		for(let index in this.area.list){
			let brick = this.area.list[index]
			this.gizmos_brick(brick[0], brick[1])
		}
	}
	define_aim(x,y){
		let result = []


		for(let index in this.area.list){
			let brick = this.area.list[index]

			if(brick[0]-this.brick_scale*0.5 <= x && 
			   brick[0]+this.brick_scale*0.5 >= x &&
			   brick[1]-this.brick_scale*0.5 <= y && 
			   brick[1]+this.brick_scale*0.5 >= y){
				result = index
			}
		}

		if(result[0] == null || result[1] == null){
			result = [this.aim.x, null, this.aim.y]
		}

		let num = ''
		let res = []		
		for(let i in result){
			if(result[i]!=','){
				num += result[i]
			}else{
				res.push(parseInt(num))
				num = ''
			}
		}
		res.push(parseInt(num))
		result = res

		if(result.length == 2){
		this.aim.x = result[0]
		this.aim.y = result[1]
		}

		for(let index in this.pathFinder){
			this.pathFinder[index].aim = this.aim
		} 
	}
	define_agent(index, x, y){
		this.pathFinder[index].define_agent(x,y)
	}
	gizmoz_obstacle(){
		function draw(player,x,y,brick_scale){
			ctx.beginPath()
			ctx.fillStyle = '#FFFFFF'
			ctx.rect(x+0.5*brick_scale,y+0.5*brick_scale, brick_scale, brick_scale)
			ctx.fill()
		}
		for(let i=0; i<this.obstacle_area.list.length; i++){
			let brick = this.obstacle_area.list[i]

			//let x = brick[0]
			//let y = brick[1]

			if(brick == null){
				continue
			}

			let x = brick.x
			let y = brick.y

			draw(this.player,x,y,this.brick_scale)
		}
	}
	update(){
		//this.draw_area()

  		if(this.edge_cond()){

  		//dark()	

  		this.define_aim(this.player.x, this.player.y)

  		this.gizmos_line()

  		//this.gizmos_object(this.aim.x, this.aim.y)

  		this.agent_move()

		//this.draw_agent()
		}
	}
	edge_cond(){
		let width = Math.floor(this.area.scale.width/2)*this.brick_scale
		let height = Math.floor(this.area.scale.height/2)*this.brick_scale

		return this.player.x > this.x-width && this.player.x < this.x+width &&
			   this.player.y > this.y-height && this.player.y < this.y+height
	}
}

class Collision2D{
	constructor(matrix,player,brick_scale){
		this.player = player

		this.obstacle_area = {list:matrix}
		this.brick_scale = brick_scale
	}
	update(){
		function collision2d_player(player,x,y,brick_scale){
			let diff = 0.6
			let cond01 = player.x > x-brick_scale*diff*2 && player.x < x+brick_scale*diff
			let cond02 = player.y > y-brick_scale*diff*3 && player.y < y+brick_scale*diff

			return cond01 && cond02
		}

		function collision2d_bullet(bullet,x,y,brick_scale){
			let diff = 0.6
			let cond01 = bullet.x > x-brick_scale*diff*(-0.4) && bullet.x < x+brick_scale*diff*2
			let cond02 = bullet.y > y-brick_scale*diff*(-0.4) && bullet.y < y+brick_scale*diff*2

			return cond01 && cond02
		}

		for(let i=0; i<this.obstacle_area.list.length; i++){
			let brick = this.obstacle_area.list[i]

			//let x = brick[0]
			//let y = brick[1]


			if(brick == null){
				continue
			}

			let x = brick.x
			let y = brick.y

			/*
			ctx.beginPath()
			ctx.fillStyle = '#FFFFFF'
			ctx.arc(x+this.brick_scale/2,y+this.brick_scale/2,10,0, Math.PI * 2)
			ctx.fill()
			*/

			if(collision2d_player(this.player, x, y, this.brick_scale)){
				this.player.save_velocity()
				while(collision2d_player(this.player, x, y, this.brick_scale)){
				this.player.x -= this.player.saved.velocity.x
				this.player.y -= this.player.saved.velocity.y
				}
				console.log(this.player.velocity.x, this.player.velocity.y)
			}
			for(let b in this.player.bullets){
				let bullet = this.player.bullets[b]
				if(collision2d_bullet(bullet, x, y, this.brick_scale)){
					this.player.delete_bullet(b)
				}
			}
			collision2d_player(this.player, x, y, this.brick_scale)
		}
	}
}
function dark(){
	ctx.fillStyle = '#000000'
  	ctx.globalAlpha = 0.6
  	ctx.fillRect(0,0,canvas.width,canvas.height)
  	ctx.globalAlpha = 1
}
