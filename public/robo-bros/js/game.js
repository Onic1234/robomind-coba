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
	setPlatform(this["map_"+game.level], dataGambar.tileset, 32, game.hero);

	// Automatically show Defeat Statistics Modal when player dies!
	game.gameOver = function() {
		game.aktif = false;
		showBrosResultModal(false);
	};

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
		// Automatically show Victory Statistics Modal when player reaches finish flag!
		showBrosResultModal(true);
	}
}

function drawBrosRadarChart(canvasId, scores) {
	const canvas = document.getElementById(canvasId);
	if (!canvas) return;
	const ctx = canvas.getContext('2d');
	const dpr = window.devicePixelRatio || 1;

	const cssWidth = 210;
	const cssHeight = 190;
	canvas.width = cssWidth * dpr;
	canvas.height = cssHeight * dpr;
	canvas.style.width = cssWidth + 'px';
	canvas.style.height = cssHeight + 'px';

	ctx.scale(dpr, dpr);
	ctx.clearRect(0, 0, cssWidth, cssHeight);

	const centerX = cssWidth / 2;
	const centerY = cssHeight / 2 + 2;
	const radius = 55;

	const axes = [
		{ name: "Spasial", val: scores.spasial || 88, align: "center", dy: -12 },
		{ name: "Keputusan", val: scores.keputusan || 92, align: "left", dy: 2 },
		{ name: "Kontrol Diri", val: scores.kontrolDiri || 85, align: "left", dy: 10 },
		{ name: "Memori Kerja", val: scores.memori || 90, align: "right", dy: 10 },
		{ name: "Fokus", val: scores.fokus || 95, align: "right", dy: 2 }
	];
	const numAxes = axes.length;

	// Grid Pentagon rings
	[0.25, 0.5, 0.75, 1.0].forEach((rFactor, idx) => {
		ctx.beginPath();
		for (let i = 0; i < numAxes; i++) {
			const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
			const x = centerX + radius * rFactor * Math.cos(angle);
			const y = centerY + radius * rFactor * Math.sin(angle);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath();
		ctx.strokeStyle = idx === 3 ? 'rgba(168, 85, 247, 0.4)' : 'rgba(56, 189, 248, 0.2)';
		ctx.lineWidth = 1;
		ctx.stroke();
	});

	// Axis Spokes
	for (let i = 0; i < numAxes; i++) {
		const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
		const x = centerX + radius * Math.cos(angle);
		const y = centerY + radius * Math.sin(angle);
		ctx.beginPath();
		ctx.moveTo(centerX, centerY);
		ctx.lineTo(x, y);
		ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
		ctx.stroke();
	}

	// Filled Translucent Polygon
	ctx.beginPath();
	axes.forEach((axis, i) => {
		const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
		const r = radius * (Math.min(100, Math.max(20, axis.val)) / 100);
		const x = centerX + r * Math.cos(angle);
		const y = centerY + r * Math.sin(angle);
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	});
	ctx.closePath();
	ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
	ctx.fill();
	ctx.strokeStyle = '#c084fc';
	ctx.lineWidth = 2.5;
	ctx.stroke();

	// Glowing Nodes
	axes.forEach((axis, i) => {
		const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
		const r = radius * (Math.min(100, Math.max(20, axis.val)) / 100);
		const x = centerX + r * Math.cos(angle);
		const y = centerY + r * Math.sin(angle);
		ctx.beginPath();
		ctx.arc(x, y, 4, 0, Math.PI * 2);
		ctx.fillStyle = '#ffffff';
		ctx.fill();
		ctx.strokeStyle = '#a855f7';
		ctx.lineWidth = 2;
		ctx.stroke();
	});

	// Axis Text Labels
	ctx.font = 'bold 9.5px system-ui, sans-serif';
	ctx.fillStyle = '#e2e8f0';

	axes.forEach((axis, i) => {
		const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
		const labelR = radius + 18;
		const x = centerX + labelR * Math.cos(angle);
		const y = centerY + labelR * Math.sin(angle) + (axis.dy || 0);
		ctx.textAlign = axis.align || 'center';
		ctx.fillText(axis.name, x, y);
	});
}

var lastModalResultWin = true;

function showBrosResultModal(isWin) {
	if (typeof isWin === 'undefined') isWin = true;
	lastModalResultWin = isWin;

	const modal = document.getElementById('resultModal');
	if (!modal) return;

	modal.style.display = 'flex';
	const currentLvl = (game && game.level) ? game.level : 1;
	const baseScore = (game && game.score) ? game.score : (isWin ? 170 : 50);
	const bonusScore = isWin ? 44 : 0;
	const totalScore = baseScore + bonusScore;

	const missionTagEl = document.getElementById('modalMissionTag');
	if (missionTagEl) {
		missionTagEl.innerText = isWin ? "MISSION COMPLETED" : "MISSION FAILED";
		missionTagEl.style.color = isWin ? "#F59E0B" : "#EF4444";
	}

	const titleEl = document.getElementById('modalLevelTitle');
	if (titleEl) {
		titleEl.innerText = isWin ? `EXCELLENT! LEVEL ${currentLvl} CLEARED!` : `ROBOT TERHENTI! LEVEL ${currentLvl}`;
		titleEl.style.color = isWin ? "#34D399" : "#EF4444";
	}

	const subTextEl = document.getElementById('modalSubText');
	if (subTextEl) {
		subTextEl.innerText = isWin ? "Petualangan Robo-Bros → Selesai!" : "Robot Terkena Rintangan / Jatuh Ke Jurang";
	}

	const starEl = document.getElementById('modalStars');
	if (starEl) {
		starEl.innerText = isWin ? "⭐ ⭐ ⭐" : "⭐ ☆ ☆";
	}

	const fruitEl = document.getElementById('resFruitCount');
	if (fruitEl) fruitEl.innerText = isWin ? "8/8 Buah Segar" : `${Math.floor(baseScore / 10)} Buah Segar`;

	const accuracyEl = document.getElementById('resAccuracy');
	if (accuracyEl) accuracyEl.innerText = isWin ? "100% Bebas Luka" : "Terkena Luka Rintangan";

	const timeEl = document.getElementById('resTimeBonus');
	if (timeEl) timeEl.innerText = isWin ? "+27s" : "+0s";

	const scoreTextEl = document.getElementById('modalScoreText');
	if (scoreTextEl) scoreTextEl.innerText = `+${baseScore} Koin`;

	const bonusTextEl = document.getElementById('modalBonusText');
	if (bonusTextEl) bonusTextEl.innerText = `+${bonusScore} Koin`;

	const coinTextEl = document.getElementById('modalCoinText');
	if (coinTextEl) coinTextEl.innerText = `${totalScore} KOIN`;

	const btnNext = document.getElementById('btnNextLevel');
	if (btnNext) {
		if (!isWin) {
			btnNext.innerText = "[ 🔄 COBA LAGI (Ulangi Level) ]";
			btnNext.style.background = "linear-gradient(135deg, #EF4444, #DC2626)";
		} else if (currentLvl >= 2) {
			btnNext.innerText = "[ SELESAI & KLAIM HADIAH 🏆 ]";
			btnNext.style.background = "linear-gradient(135deg, #10B981, #059669)";
		} else {
			btnNext.innerText = "[ CONTINUE (Lanjut Level) ➔ ]";
			btnNext.style.background = "linear-gradient(135deg, #0284C7, #0B84FF)";
		}
	}

	setTimeout(() => {
		drawBrosRadarChart('brosRadarCanvas', isWin ? {
			spasial: 88,
			keputusan: 92,
			kontrolDiri: 85,
			memori: 90,
			fokus: 95
		} : {
			spasial: 62,
			keputusan: 55,
			kontrolDiri: 58,
			memori: 70,
			fokus: 60
		});
	}, 50);
}

function continueNextLevel() {
	const modal = document.getElementById('resultModal');
	if (modal) modal.style.display = 'none';

	if (lastModalResultWin) {
		game.level++;
		if (game.level >= 3) {
			game.level = 1;
			jalankan(halamanCover);
		} else {
			game.status = "mulai";
			setAwal();
		}
	} else {
		// Retry level on defeat
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
