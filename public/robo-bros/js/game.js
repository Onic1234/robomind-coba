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
	if (game.kanan){
		gerakLevel(game.hero, 1.8, 0);
	}else if (game.kiri){				
		gerakLevel(game.hero, -1.8, 0);
	}
	if (game.atas){
		gerakLevel(game.hero, 0, -9.2);
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
