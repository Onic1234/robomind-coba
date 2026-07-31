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

function startScreen(){	
	hapusLayar("#67d2d6");
	tampilkanGambar(dataGambar.logo, 600, 250);
	var startBtn = tombol(dataGambar.startBtn, 600, 350);
	if (tekan(startBtn)){
		jalankan(halamanCover);
	}
}
function halamanCover(){
	hapusLayar("#9c9695");
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
	hapusLayar("#9c9695");
	if (game.kanan){
		gerakLevel(game.hero, 2.0, 0);
	}else if (game.kiri){				
		gerakLevel(game.hero, -2.0, 0);
	}
	if (game.atas){
		gerakLevel(game.hero, 0, -8.5);
	}
		
	latar(dataGambar.bg, 0, 0.5);
	buatLevel();
	cekItem();
	teks(game.score, 40, 60, "Calibri-bold-20pt-left-biru");
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
		showBrosResultModal();
	}
}

function drawBrosRadarChart(canvasId, scores) {
	const canvas = document.getElementById(canvasId);
	if (!canvas) return;
	const ctx = canvas.getContext('2d');
	const width = canvas.width;
	const height = canvas.height;
	const center = width / 2;
	const radius = 52;
	ctx.clearRect(0, 0, width, height);

	const axes = [
		{ name: "Spasial", val: scores.spasial || 88 },
		{ name: "Keputusan", val: scores.keputusan || 92 },
		{ name: "Kontrol Diri", val: scores.kontrolDiri || 85 },
		{ name: "Memori Kerja", val: scores.memori || 90 },
		{ name: "Fokus", val: scores.fokus || 95 }
	];
	const numAxes = axes.length;

	// Grid rings
	[0.2, 0.4, 0.6, 0.8, 1.0].forEach(rFactor => {
		ctx.beginPath();
		for (let i = 0; i < numAxes; i++) {
			const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
			const x = center + radius * rFactor * Math.cos(angle);
			const y = center + radius * rFactor * Math.sin(angle);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath();
		ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
		ctx.lineWidth = 1;
		ctx.stroke();
	});

	// Axis Spokes
	for (let i = 0; i < numAxes; i++) {
		const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
		const x = center + radius * Math.cos(angle);
		const y = center + radius * Math.sin(angle);
		ctx.beginPath();
		ctx.moveTo(center, center);
		ctx.lineTo(x, y);
		ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
		ctx.stroke();
	}

	// Filled Polygon
	ctx.beginPath();
	axes.forEach((axis, i) => {
		const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
		const r = radius * (Math.min(100, Math.max(20, axis.val)) / 100);
		const x = center + r * Math.cos(angle);
		const y = center + r * Math.sin(angle);
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	});
	ctx.closePath();
	ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
	ctx.fill();
	ctx.strokeStyle = '#c084fc';
	ctx.lineWidth = 2.5;
	ctx.stroke();

	// Glowing Data Points
	axes.forEach((axis, i) => {
		const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
		const r = radius * (Math.min(100, Math.max(20, axis.val)) / 100);
		const x = center + r * Math.cos(angle);
		const y = center + r * Math.sin(angle);
		ctx.beginPath();
		ctx.arc(x, y, 4, 0, Math.PI * 2);
		ctx.fillStyle = '#ffffff';
		ctx.fill();
		ctx.strokeStyle = '#a855f7';
		ctx.lineWidth = 2;
		ctx.stroke();
	});

	// Axis Labels
	ctx.font = 'bold 9px system-ui, sans-serif';
	ctx.fillStyle = '#f8fafc';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	axes.forEach((axis, i) => {
		const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
		const labelR = radius + 18;
		const x = center + labelR * Math.cos(angle);
		const y = center + labelR * Math.sin(angle);
		ctx.fillText(axis.name, x, y);
	});
}

function showBrosResultModal() {
	const modal = document.getElementById('resultModal');
	if (modal) {
		modal.style.display = 'flex';
		document.getElementById('modalLevelTitle').innerText = `LEVEL 0${game.level} CLEARED!`;
		document.getElementById('modalScoreText').innerText = `+${game.score} Skor`;
		document.getElementById('modalCoinText').innerText = `${game.score} KOIN`;

		const btnNext = document.getElementById('btnNextLevel');
		if (game.level >= 2) {
			btnNext.innerText = "[ SELESAI & KLAIM HADIAH 🏆 ]";
		} else {
			btnNext.innerText = "[ CONTINUE (Lanjut Level) ➔ ]";
		}

		setTimeout(() => {
			drawBrosRadarChart('brosRadarCanvas', {
				spasial: 88,
				keputusan: 92,
				kontrolDiri: 85,
				memori: 90,
				fokus: 95
			});
		}, 50);
	}
}

function continueNextLevel() {
	const modal = document.getElementById('resultModal');
	if (modal) modal.style.display = 'none';

	game.level++;
	if (game.level >= 3) {
		game.level = 1;
		jalankan(halamanCover);
	} else {
		game.status = "mulai";
		setAwal();
	}
}

function exitToCover() {
	const modal = document.getElementById('resultModal');
	if (modal) modal.style.display = 'none';
	game.level = 1;
	jalankan(halamanCover);
}
