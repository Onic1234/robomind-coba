setGame("1200x600");
game.folder = "assets";
//file gambar yang dipakai dalam game
var gambar = {
	logo:"logo.png",
	startBtn:"tombolStart.png",
	cover:"cover.jpg",
	playBtn:"btn-play.png",
	maxBtn:"maxBtn.png",
	minBtn:"minBtn.png",
	idle:"Idle.png",
	run:"Run.png",
	jump:"Jump.png",
	fall:"Fall.png",
	hit:"hit.png",
	tileset:"terrain.png",
	bg:"bg.png",
	item1:"Strawberry.png",
	item2:"Kiwi.png",
	musuh1Idle:"enemy1Idle.png",
	musuh1Run:"enemy1Run.png",
	musuh1Hit:"enemy1Hit.png",
	bendera:"Flag.png"
}
//file suara yang dipakai dalam game
var suara = {
}

//load gambar dan suara lalu jalankan startScreen
loading(gambar, suara, startScreen);

function drawRoboMindBrandingLogo(x, y) {
	if (!konten) return;
	konten.save();

	// Robot Head Icon
	var rx = x - 170;
	var ry = y;

	// Robot Outer Antenna & Head Glow
	konten.shadowColor = "#00e5ff";
	konten.shadowBlur = 15;

	// Antenna stem & sphere
	konten.fillStyle = "#38bdf8";
	konten.beginPath();
	konten.arc(rx, ry - 52, 7, 0, Math.PI * 2);
	konten.fill();
	konten.fillRect(rx - 2, ry - 46, 4, 12);

	// Robot Dome Head
	konten.fillStyle = "#0f172a";
	konten.strokeStyle = "#00e5ff";
	konten.lineWidth = 3;
	konten.beginPath();
	konten.arc(rx, ry - 15, 34, 0, Math.PI * 2);
	konten.fill();
	konten.stroke();

	// Glowing Neon Visor
	konten.fillStyle = "#00e5ff";
	konten.shadowColor = "#38bdf8";
	konten.shadowBlur = 10;
	konten.beginPath();
	if (konten.roundRect) {
		konten.roundRect(rx - 22, ry - 24, 44, 16, 6);
	} else {
		konten.fillRect(rx - 22, ry - 24, 44, 16);
	}
	konten.fill();

	// Two Glowing White Eyes
	konten.fillStyle = "#ffffff";
	konten.beginPath();
	konten.arc(rx - 10, ry - 16, 4, 0, Math.PI * 2);
	konten.arc(rx + 10, ry - 16, 4, 0, Math.PI * 2);
	konten.fill();

	// Cute Robot Cheeks
	konten.fillStyle = "#f43f5e";
	konten.beginPath();
	konten.arc(rx - 22, ry - 4, 4, 0, Math.PI * 2);
	konten.arc(rx + 22, ry - 4, 4, 0, Math.PI * 2);
	konten.fill();

	konten.shadowBlur = 0;

	// TEXT BRANDING: "RoboMind"
	konten.font = "900 68px system-ui, sans-serif";
	konten.textAlign = "left";
	konten.textBaseline = "middle";

	// 3D Shadow Text
	konten.fillStyle = "#091428";
	konten.fillText("Robo", x - 110, y + 4);
	konten.fillText("Mind", x + 65, y + 4);

	// Foreground Vibrant Text
	konten.fillStyle = "#00e5ff";
	konten.shadowColor = "#00e5ff";
	konten.shadowBlur = 12;
	konten.fillText("Robo", x - 112, y);

	konten.fillStyle = "#34d399";
	konten.shadowColor = "#34d399";
	konten.shadowBlur = 12;
	konten.fillText("Mind", x + 63, y);
	konten.shadowBlur = 0;

	// Subtitle Tagline
	konten.font = "bold 16px system-ui, sans-serif";
	konten.fillStyle = "#f8fafc";
	konten.textAlign = "center";
	konten.fillText("PETUALANGAN BELAJAR ROBOT", x + 20, y + 48);

	konten.restore();
}

function startScreen(){	
	hapusLayar("#0f172a");
	drawRoboMindBrandingLogo(590, 210);
	var startBtn = tombol(dataGambar.startBtn, 600, 360);
	if (tekan(startBtn)){
		jalankan(halamanCover);
	}
}
function halamanCover(){
	hapusLayar("#0f172a");
	gambarFull(dataGambar.cover);
	var playBtn = tombol(dataGambar.playBtn, 1100, 500);
	if (tekan(playBtn) || game.spasi){
		if (game.aktif) {
			//mulai game dengan menambahkan transisi
			game.status = "mulai";
			game.level = 1;
			game.score = 0;
			game.warnaTransisi = "#8f8f8f";
			transisi("out", setAwal);
		}
	}	
	resizeBtn(1150,50);
	efekTransisi();
}

function setAwal(){
	game.aktif = true;
	game.hero = setSprite(dataGambar.idle,32,32);
	game.hero.animDiam = dataGambar.idle;
	game.hero.animJalan = dataGambar.run;
	game.hero.animLompat = dataGambar.jump;
	game.hero.animJatuh = dataGambar.fall;
	game.hero.animMati = dataGambar.hit;
	game.skalaSprite = 2;	
	//setPlatform(map_1, dataGambar.tileset, 32, game.hero);
	setPlatform(this["map_"+game.level], dataGambar.tileset, 32, game.hero);
	game.gameOver = ulangiPermainan;
	//set item
	setPlatformItem(1, dataGambar.item1);
	setPlatformItem(2, dataGambar.item2);
	//set musuh
	var musuh1 = {}
	musuh1.animDiam = dataGambar.musuh1Idle;
	musuh1.animJalan = dataGambar.musuh1Run;
	musuh1.animMati = dataGambar.musuh1Hit;
	setPlatformEnemy(1, musuh1);
	//set trigger
	setPlatformTrigger(1, dataGambar.bendera);
	if (game.status == "mulai"){
		game.status = "main";
		mulaiPermainan();
	}
}

function mulaiPermainan(){
	jalankan(gameLoop);
	transisi("in");
}

function ulangiPermainan(){	
	setAwal();	
	game.aktif = true;
	jalankan(gameLoop);
}

function gameLoop(){
	hapusLayar("#0b192c");
	var moveSpeed = game.lompat ? 2.6 : 1.6;
	if (game.kanan){
		gerakLevel(game.hero, moveSpeed, 0);
	}else if (game.kiri){				
		gerakLevel(game.hero, -moveSpeed, 0);
	}
	if (game.atas){
		gerakLevel(game.hero, 0, -9.4);
	}
		
	latar(dataGambar.bg, 0.3, 0);
	buatLevel();
	cekItem();
	teks(game.score, 40, 70, "Calibri-bold-20pt-left-biru");
	efekTransisi();
}

function cekItem(){
	if (game.itemID > 0){
		tambahScore(10*game.itemID);
		game.itemID = 0;
	}
	if (game.musuhID != 0){
		tambahScore(25);
		game.musuhID = 0;
	}
	if (game.triggerID == 1){
		game.triggerID = 0;
		game.aktif = false;
		transisi("out", naikLevel);		
	}
}

function naikLevel(){
	game.level++;
	if (game.level > 10){
		transisi("in");
		jalankan(halamanCover);
	}else{
		game.status = "mulai";
		setAwal();
	}
}
