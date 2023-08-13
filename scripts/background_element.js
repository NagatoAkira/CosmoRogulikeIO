class backgroundElement{
	constructor(x,y,scale,img){
		this.x = x
		this.y = y
		this.scale = scale

		this.image = new Image
		this.image.src = img
	}
	draw(){
		ctx.drawImage(this.image, this.x+this.scale/2, this.y, this.scale, this.scale)
	}
	update(){
		this.draw()
	}
}