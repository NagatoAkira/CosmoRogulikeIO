class Player{
	constructor(x,y){
		this.x = x
		this.y = y

		this.velocity = {x:0, y:0}
		this.speed = 12

		this.image = new Image()
		this.image.src = "assets\\main\\main.png"
		this.scale = 180

	    this.gun_img = new Image()
	    this.gun_img.src = "assets\\main\\gun.png"

	    this.mouse_pos = [0,0]

	    this.bullets = []
	    this.b_speed = 15

	    this.hp = 100

	    this.saved = {velocity:{x: 0, y: 0}}
	    this.stop_move = true
	}
	save_velocity(){
		if(this.velocity.x == 0 && this.velocity.y == 0){
			return false	
		}
		this.saved.velocity.x = this.velocity.x
		this.saved.velocity.y = this.velocity.y

		return true
	}
	draw(){

		ctx.drawImage(this.image, this.x, this.y, this.scale, this.scale)
		this.draw_bullet()
		this.gun(this.x+this.scale/2, this.y+110)
	}
	gun(x,y){
		this.gun_degrees = Math.atan2(this.mouse_pos[0] - (this.x+this.scale/2), this.mouse_pos[1] - (this.y+this.scale/2+30)) 
		ctx.save()
		ctx.translate(x,y)
		ctx.rotate(-this.gun_degrees + Math.PI/2)
		ctx.drawImage(this.gun_img, 0, -this.scale/2, this.scale, this.scale)
		ctx.restore()
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
	delete_bullet(index){
		delete this.bullets[index]
	}
	shoot(){
		let dir_ = ([Math.sin(this.gun_degrees), Math.cos(this.gun_degrees)])
		this.bullets.push({x: this.x+this.scale/2+dir_[0]*50, y: this.y+this.scale/2+dir_[1]*50+28, dir: dir_})
	}
	draw_bullet(){
		function edge_cond(x,y,canvas){
			return (x>0 && x<canvas.width &&
				    y>0 && y<canvas.height)
			}

		for(let index in this.bullets){
			let b = this.bullets[index]
			this.bullets[index].x += b.dir[0] * this.b_speed
			this.bullets[index].y += b.dir[1] * this.b_speed

			if(!edge_cond(b.x, b.y, canvas)){
				this.delete_bullet(index)
			}

			ctx.beginPath()
			ctx.fillStyle = '#E15BF6'
			ctx.arc(b.x+5, b.y-20, 10, 0, Math.PI * 2)
			ctx.fill()
		}
		this.bullets = this.clear_undefined(this.bullets)
	}
	reflect(){
		if (this.gun_degrees < 0){
			this.gun_img.src = "assets\\main\\reflect_gun.png"
			this.image.src = "assets\\main\\reflect_main.png"
		}else{
			this.image.src = "assets\\main\\main.png"
			this.gun_img.src = "assets\\main\\gun.png"
		}
	}
	update(){
		if(this.velocity.x != 0 && this.velocity.y != 0){
			this.velocity.x = this.velocity.x > 0 ? 0.7:-0.7
			this.velocity.y = this.velocity.y > 0 ? 0.7:-0.7
		}

		if(this.stop_move){
			this.x += this.velocity.x*this.speed
			this.y += this.velocity.y*this.speed
		}
		this.draw()
		this.reflect()
	}
}