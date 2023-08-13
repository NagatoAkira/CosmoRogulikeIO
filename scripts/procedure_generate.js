class Room{
	constructor(x,y,height,width,brick_scale){
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.brick_scale = brick_scale

		this.bricks_index = {list : []}
		this.inner_space = {list : [],
							pathList: []}

		this.layers = []

		this.paths = []
		this.paths_static = []

		this.simple_matrix = {bricks_index: [], inner_space: []}

		this.floorAsset = new Image()
		this.floorAsset.src = "assets\\main\\floor.png"
	}
	matrix(){
		let width = Math.floor(this.width/2)
		let height = Math.floor(this.height/2)
		for(let i=-width; i<width; i++){
			for(let j=-height; j<height; j++){
				let x = i*(this.brick_scale)+this.x
				let y = j*(this.brick_scale)+this.y
				if(i == width-1 || i == -width || j == height-1 || j==-height){
					this.bricks_index.list.push({x: x, y: y})
					this.simple_matrix.bricks_index.push({x: i+width, y: j+height})
				}else{
					this.inner_space.list.push({x:x, y:y})
					this.simple_matrix.inner_space.push({x: i+width, y: j+height})
				}
			}
		}
	}
	clear_undefined(list){
		let cleared_list = []
		for(let index in list){
			if(list[index] != null){
				cleared_list.push(list[index])
			}
		}
		return cleared_list
	}
	apply_layer(){
		this.layers.push(this.bricks_index.list)
		this.bricks_index.list = []
	}
	path(x_,y_,dir){
		for(let index_upper in this.layers){
			for(let i=0; i<3; i++){
				for(let j=0; j<3; j++){
			let x = this.x + (x_ + i - 1)*this.brick_scale
			let y = this.y + (y_ + j - 1)*this.brick_scale
			let path = true

			for (let index_lower in this.layers[index_upper]){
				let brick = this.layers[index_upper][index_lower]
				if(x == brick.x && y == brick.y){
					path = false
					break
				}
			}

			for(let index in this.inner_space.pathList){
					let brick = this.inner_space.pathList[index]
					if(x == brick.x && y == brick.y){
						path = false
						break
					}
				}
			for(let index in this.inner_space.list){
					let brick = this.inner_space.list[index]
					if(x == brick.x && y == brick.y){
						path = false
						break
					}
				}

			for(let index in this.bricks_index.list){
				let brick = this.bricks_index.list[index]
				if(x == brick.x && y == brick.y){
					path = false
					break
				}
			}

			let check_dir = [null,null]	
			if(dir != null){
			check_dir = [(dir[0]+x_)*this.brick_scale+this.x, (dir[1]+y_)*this.brick_scale+this.y]
			}

			if(check_dir[0]==x && check_dir[1]==y){
				path = false
			}

			if(path){
				this.layers[index_upper].push({x:x,y:y})
			}
			}
			}

			for(let index_lower in this.layers[index_upper]){
				if(this.x + x_*this.brick_scale == this.layers[index_upper][index_lower].x &&
				   this.y + y_*this.brick_scale == this.layers[index_upper][index_lower].y){
				   	this.inner_space.pathList.push(this.layers[index_upper][index_lower])
					delete this.layers[index_upper][index_lower]
					this.layers[index_upper] = this.clear_undefined(this.layers[index_upper])
					break
				}
			}
		}
	}
	clear_data(){
		this.inner_space = []
		this.bricks_index = []
	}
	brick_draw(x,y,color){
		ctx.fillStyle = color
		ctx.fillRect(x,y,this.brick_scale*1.009, this.brick_scale*1.009)
	}
	floor_draw(x,y){
		ctx.drawImage(this.floorAsset, x, y, this.brick_scale, this.brick_scale)
	}
	draw(){
		for(let index in this.inner_space.list){
			let floor = this.inner_space.list[index]
			this.floor_draw(floor.x, floor.y)
		}
		for(let index in this.inner_space.pathList){
			let floor = this.inner_space.pathList[index]
			this.floor_draw(floor.x, floor.y)
		}
		for(let index in this.bricks_index.list){
			this.brick_draw(this.bricks_index.list[index].x, this.bricks_index.list[index].y, '#8f8f8f')
		}
		for(let index_upper in this.layers){
			for (let index_lower in this.layers[index_upper]){
				this.brick_draw(this.layers[index_upper][index_lower].x, this.layers[index_upper][index_lower].y, '#375CDD')
			}
		}
	}
	update(){
		this.draw()
	}
}

class Location{
	init(room,player){
		this.rooms = []
		this.rooms.push(room)
		this.rooms[0].matrix()
		this.rooms[0].apply_layer()
		this.x = this.rooms[0].x
		this.y = this.rooms[0].y
		this.brick_scale = this.rooms[0].brick_scale
		this.inner_space = []

		this.pathFinderList = []
		this.collisionList = []

		this.player = player
	}
	append(index, dir, distance, width, height){
		let x = this.rooms[index].x+dir[0]*this.brick_scale*distance
		let y = this.rooms[index].y+dir[1]*this.brick_scale*distance
		this.rooms.push(new Room(x, y, width, height, this.brick_scale))
		this.rooms[this.rooms.length-1].matrix()
		this.rooms[this.rooms.length-1].apply_layer()
	}
	clear_undefined(list){
		let cleared_list = []
		for(let index in list){
			if(list[index] != null){
				cleared_list.push(list[index])
			}
		}
		return cleared_list
	}
	connect(index01, index02){
		let room01 = this.rooms[index01]
		let room02 = this.rooms[index02].inner_space.list
		let dir = [0,0]

		let x = 0
		let y = 0

		for(let index in room02){
			let brick = room02[index]
			if(room01.x == brick.x){
				if(y < Math.abs((brick.y-room01.y)/this.brick_scale)){
					y = (brick.y-room01.y)/this.brick_scale 
					dir[1] = 1
				}
			}
			if(room01.y == brick.y){
				if(x < Math.abs((brick.x-room01.x)/this.brick_scale)){
					x = (brick.x-room01.x)/this.brick_scale
					dir[0] = 1 
				}
			}
		}

		let width = Math.floor(this.rooms[index02].width/2)
		let height = Math.floor(this.rooms[index02].height/2)

	
		x -= width-1
		x += x>0 ? 1:0
		x *= dir[0]

		y -= height-1
		y += y>0 ? 1:0
		y *= dir[1]

		for(let i = -1; i < 2; i++){

		if(i==0){
			continue
		}

		for(let j = -1; j < 2; j++){

		if(this.rooms[index02].x + width*this.brick_scale*i == this.rooms[index01].x + (x + j)*this.brick_scale ||
		   this.rooms[index02].y + height*this.brick_scale*i == this.rooms[index01].y + (y + j)*this.brick_scale){
		   	console.log('found')
			return [0,0]
		}
		}
		}

		return [x,y]	
	}
	path(index01, index02){
		let distance = this.connect(index01, index02)

		let max = (distance[0]==0 ? distance[1]:distance[0])
		let dir = [(distance[0]==0 ? 0:max/Math.abs(max)), (distance[1]==0 ? 0:max/Math.abs(max))]

		max -= Math.floor(this.rooms[index02].width/2)*dir[0]
		max -= Math.floor(this.rooms[index02].height/2)*dir[1]

		max -= max>0 ? 1:-1
		
		for(let count=0; Math.abs(count)<Math.abs(max); count+=max>0 ? 1:-1){
			if(distance[0]==0){
				this.rooms[index01].path(0, count, dir)
				this.rooms[index01].path(-1, count, dir)
			}else{
				this.rooms[index01].path(count, 0, dir)
				this.rooms[index01].path(count, -1, dir)
			}	
		}

		let room01 = this.rooms[index01]
		let room02 = this.rooms[index02].layers

		let x1 = room01.x+(dir[0]*Math.abs(max)+dir[0])*this.brick_scale
		let y1 = room01.y+(dir[1]*Math.abs(max)+dir[1])*this.brick_scale


		let x2 = 0
		let y2 = 0
		if(dir[0] == 0){
		x2 = room01.x-this.brick_scale
		y2 = room01.y+(dir[1]*Math.abs(max)+dir[1])*this.brick_scale
		}
		if(dir[1] == 0){
		x2 = room01.x+(dir[0]*Math.abs(max)+dir[0])*this.brick_scale
		y2 = room01.y-this.brick_scale	
		}


		for(let index_upper in room02){
			for(let index_lower in room02[index_upper]){
				let brick = this.rooms[index02].layers[index_upper][index_lower]

				
				if(brick.x==x1 && brick.y==y1 ||
				   brick.x==x2 && brick.y==y2){
				   	this.rooms[index02].inner_space.pathList.push(this.rooms[index02].layers[index_upper][index_lower])
					delete this.rooms[index02].layers[index_upper][index_lower]
				}
			}
			this.rooms[index02].layers[index_upper] = this.clear_undefined(this.rooms[index02].layers[index_upper])
		}


		if(dir[0]==0){
			x1 = room01.x - this.brick_scale
			y1 = y2 - this.brick_scale*dir[1]

			x2 = room01.x
			y2 = y2 - this.brick_scale*dir[1]
		}
		if(dir[1]==0){
			x1 = x2 - this.brick_scale*dir[0]
			y1 = room01.y - this.brick_scale

			x2 = x2 - this.brick_scale*dir[0]
			y2 = room01.y
		}

		for(let index_upper in room01.layers){
			for(let index_lower in room01.layers[index_upper]){
				let brick = this.rooms[index01].layers[index_upper][index_lower]

				if(brick.x == x2 && brick.y == y2 ||
					brick.x == x1 && brick.y == y1){
					this.rooms[index01].inner_space.pathList.push(this.rooms[index01].layers[index_upper][index_lower])
					delete this.rooms[index01].layers[index_upper][index_lower]
				}
			}
			this.rooms[index01].layers[index_upper] = this.clear_undefined(this.rooms[index01].layers[index_upper])
		}
	}
	lock_generator(room_data, curr_room){
		let wall = 0
		let curr_room_data = {x: [curr_room.x+Math.floor(curr_room.width/2+wall)*this.brick_scale, 
							      curr_room.x-Math.floor(curr_room.width/2+wall)*this.brick_scale],
							  y: [curr_room.y+Math.floor(curr_room.height/2+wall)*this.brick_scale,
							      curr_room.y-Math.floor(curr_room.height/2+wall)*this.brick_scale]}
						      
		for(let index in room_data){
		let room = room_data[index]

		let room_data_cond = {x: [room.x+Math.floor(room.width/2+wall)*this.brick_scale,
								  room.x-Math.floor(room.width/2+wall)*this.brick_scale],
							  y: [room.y+Math.floor(room.height/2+wall)*this.brick_scale,
							  	  room.y-Math.floor(room.height/2+wall)*this.brick_scale]}

		if(curr_room.x<=room_data_cond.x[0] && 
		   curr_room.x>=room_data_cond.x[1] &&
		   curr_room.y<=room_data_cond.y[0] &&
		   curr_room.y>=room_data_cond.y[1]){
			return false
		}

			for(let x in curr_room_data.x){
				for(let y in curr_room_data.y){
					if(curr_room_data.x[x]<=room_data_cond.x[0] && 
				       curr_room_data.x[x]>=room_data_cond.x[1] &&
				       curr_room_data.y[y]<=room_data_cond.y[0] &&
			  		   curr_room_data.y[y]>=room_data_cond.y[1]){
						return false
					}
			    }
			}

			for(let x in room_data_cond.x){
				for(let y in room_data_cond.y){
					if(curr_room_data.x[0]>=room_data_cond.x[x] && 
				       curr_room_data.x[1]<=room_data_cond.x[x] &&
				       curr_room_data.y[0]>=room_data_cond.y[y] &&
			  		   curr_room_data.y[1]<=room_data_cond.y[y]){
						return false
					}
				}
			}
		}
		return true
	}
	generate(frequency){
		let room_data = [{x: this.rooms[0].x, y: this.rooms[0].y, width: this.rooms[0].width, height: this.rooms[0].height}]
		let dirs_cond = [[1,0],[-1,0],[0,1],[0,-1]]
		let lock_dir = [0,0]
		for(let i=1; i<frequency;i++){
			let random_dir = Math.floor(Math.random()*4)
			let distance = Math.floor(Math.random()*10+30)
			let width = Math.floor(Math.random()*10+10)
			let height = Math.floor(Math.random()*10+10)

			if(random_dir <= 2){
				distance += Math.floor(width/2)
			}else{
				distance += Math.floor(height/2)
			}


			let curr_room_data = {x: this.rooms[i-1].x+dirs_cond[random_dir][0]*distance*this.brick_scale, 
								  y: this.rooms[i-1].y+dirs_cond[random_dir][1]*distance*this.brick_scale,
								  width: width,
								  height: height}

			if (lock_dir[0] == dirs_cond[random_dir][0] && lock_dir[1] == dirs_cond[random_dir][1]){
				i--
				continue
			}
			if (this.lock_generator(room_data, curr_room_data)){
			lock_dir = dirs_cond[random_dir]
			this.append(i-1, dirs_cond[random_dir], distance, width, height)
			room_data.push({x: this.rooms[i].x, y: this.rooms[i].y, width: this.rooms[i].width, height: this.rooms[i].height})
			} else{
				i--
			}
		}

		this.connect_system()

		this.pathFinder2D()
	}

	pathFinder2D(){
		for(let index in this.rooms){
			let room = this.rooms[index]
			this.pathFinderList.push(new areaGenerate(room.x-this.brick_scale*0.5, room.y-this.brick_scale*0.5, 
									 room.height-2, room.width-2, "assets\\main\\floor.png",this.brick_scale,this.player))
			this.pathFinderList[index].append({x: 1, y: 1, img: "assets\\main\\monster.png", scale: 150})

			
			this.collisionList.push(new Collision2D(room.layers[0], this.player, this.brick_scale)) 
		}
	}

	to_one(numb){
		if(numb == 0 || Math.abs(numb)==1){
			return 0
		}
		return (numb>0 ? 1:-1)
	}

	check_dir(index, dir){
		for(let path_ in this.rooms[index].paths){
			let path = this.rooms[index].paths[path_]
			if(dir[0] == path[0] && dir[1] == path[1]){
			return false 
			}
		}
		return true
	}

	check_min(path, min){
		if(path[0]!=0){
			if(Math.abs(path[0]) > min){
				return true
			}
		}

		if(path[1]!=0){
			if(Math.abs(path[1]) > min){
				return true
			}
		}
		return false
	}

	connect_system(){
		let max = 60
		let min = 30

		for(let index01 in this.rooms){
			for(let index02 in this.rooms){
				let tunnel = this.connect(index01, index02)
				let dir = [this.to_one(tunnel[0]), this.to_one(tunnel[1])]
				if(!(dir[0]==0 && dir[1]==0)){
				if(this.check_dir(index01,dir) && this.check_min(tunnel,min)){
				if(Math.abs(tunnel[0])<max && Math.abs(tunnel[1])<max){
				this.rooms[index01].paths.push(dir)
				this.rooms[index02].paths.push([-dir[0], -dir[1]])
				this.path(index01, index02)
				}
				}
				}
			}
		}
	}

	update(){
		for(let index in this.rooms){
			this.rooms[index].update()
		}
		for(let index in this.pathFinderList){
			this.pathFinderList[index].update()
		}
	}
}