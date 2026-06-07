const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

scene.fog = new THREE.Fog(0x0a0a0a, 5, 15);

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 8;
camera.position.y = 0;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('canvas-container').appendChild(renderer.domElement);

let mouseDown = false;
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;

function createPixelLetter(letter, offsetX) {
	const pixelSize = 0.2;
	const group = new THREE.Group();

	const patterns = {
		G: [
			[0,1,1,1,1,0],
			[1,0,0,0,0,1],
			[1,0,0,0,0,0],
			[1,0,0,1,1,1],
			[1,0,0,0,0,1],
			[1,0,0,0,0,1],
			[0,1,1,1,1,0]
		],
		A: [
			[0,0,1,1,0,0],
			[0,1,0,0,1,0],
			[1,0,0,0,0,1],
			[1,1,1,1,1,1],
			[1,0,0,0,0,1],
			[1,0,0,0,0,1],
			[1,0,0,0,0,1]
		],
		M: [
			[1,0,0,0,0,1],
			[1,1,0,0,1,1],
			[1,0,1,1,0,1],
			[1,0,0,0,0,1],
			[1,0,0,0,0,1],
			[1,0,0,0,0,1],
			[1,0,0,0,0,1]
		],
		E: [
			[1,1,1,1,1,1],
			[1,0,0,0,0,0],
			[1,0,0,0,0,0],
			[1,1,1,1,1,0],
			[1,0,0,0,0,0],
			[1,0,0,0,0,0],
			[1,1,1,1,1,1]
		],
		O: [
			[0,1,1,1,1,0],
			[1,0,0,0,0,1],
			[1,0,0,0,0,1],
			[1,0,0,0,0,1],
			[1,0,0,0,0,1],
			[1,0,0,0,0,1],
			[0,1,1,1,1,0]
		],
		V: [
			[1,0,0,0,0,1],
			[1,0,0,0,0,1],
			[1,0,0,0,0,1],
			[0,1,0,0,1,0],
			[0,1,0,0,1,0],
			[0,0,1,1,0,0],
			[0,0,1,1,0,0]
		],
		R: [
			[1,1,1,1,1,0],
			[1,0,0,0,0,1],
			[1,0,0,0,0,1],
			[1,1,1,1,1,0],
			[1,0,0,1,0,0],
			[1,0,0,0,1,0],
			[1,0,0,0,0,1]
		]
	};

	const pattern = patterns[letter] || patterns.O;

	for (let row = 0; row < pattern.length; row++) {
		for (let col = 0; col < pattern[row].length; col++) {
			if (pattern[row][col] === 1) {
				const coreGeometry = new THREE.BoxGeometry(
					pixelSize * 0.7, 
					pixelSize * 0.7, 
					pixelSize * 0.7
				);
				const coreMaterial = new THREE.MeshBasicMaterial({ 
					color: 0x1a1a2e 
				});
				const core = new THREE.Mesh(coreGeometry, coreMaterial);

				core.position.x = col * pixelSize + offsetX;
				core.position.y = -row * pixelSize;
				core.position.z = 0.02;

				group.add(core);

				const edgeGeometry = new THREE.BoxGeometry(
					pixelSize, 
					pixelSize, 
					pixelSize * 0.5
				);
				const edgeMaterial = new THREE.MeshBasicMaterial({
					color: 0xff0000,
					transparent: true,
					opacity: 0.9
				});
				const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);

				edge.position.x = col * pixelSize + offsetX;
				edge.position.y = -row * pixelSize;
				edge.position.z = 0;

				edge.userData.isEdge = true;
				edge.userData.offset = row + col;
				group.add(edge);

				const glowGeometry = new THREE.BoxGeometry(
					pixelSize * 1.2, 
					pixelSize * 1.2, 
					pixelSize * 0.3
				);
				const glowMaterial = new THREE.MeshBasicMaterial({
					color: 0xff0000,
					transparent: true,
					opacity: 0.3
				});
				const glow = new THREE.Mesh(glowGeometry, glowMaterial);

				glow.position.x = col * pixelSize + offsetX;
				glow.position.y = -row * pixelSize;
				glow.position.z = -0.05;

				glow.userData.isGlow = true;
				glow.userData.offset = row + col;
				group.add(glow);
			}
		}
	}

	return group;
}

const gameGroup = new THREE.Group();
const gameLetters = ['G', 'A', 'M', 'E'];
let currentX = -4.5;

gameLetters.forEach((letter, index) => {
	const letterMesh = createPixelLetter(letter, currentX);
	letterMesh.userData.letterIndex = index;
	gameGroup.add(letterMesh);
	currentX += 1.5;
});

const overGroup = new THREE.Group();
const overLetters = ['O', 'V', 'E', 'R'];
currentX = -3.5;

overLetters.forEach((letter, index) => {
	const letterMesh = createPixelLetter(letter, currentX);
	letterMesh.userData.letterIndex = index + 4;
	overGroup.add(letterMesh);
	currentX += 1.5;
});

gameGroup.position.y = 1;
overGroup.position.y = -1;

const textContainer = new THREE.Group();
textContainer.add(gameGroup);
textContainer.add(overGroup);
scene.add(textContainer);

const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
	positions[i] = (Math.random() - 0.5) * 20;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particlesMaterial = new THREE.PointsMaterial({
	color: 0x00ffff,
	size: 0.05,
	transparent: true,
	opacity: 0.6
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

let time = 0;

function animate() {
	requestAnimationFrame(animate);
	time += 0.016; // ~60fps

	if (!mouseDown) {
		targetRotationY += 0.002;
	}
	textContainer.rotation.y += (targetRotationY - textContainer.rotation.y) * 0.05;
	textContainer.rotation.x += (targetRotationX - textContainer.rotation.x) * 0.05;

	gameGroup.position.y = 1 + Math.sin(time * 1.5) * 0.3;
	overGroup.position.y = -1 + Math.cos(time * 1.5) * 0.3;

	gameGroup.rotation.z = Math.sin(time * 0.8) * 0.05;
	overGroup.rotation.z = Math.cos(time * 0.8) * 0.05;

	textContainer.traverse((child) => {
		if (child.userData.isEdge || child.userData.isGlow) {
			const offset = child.userData.offset || 0;
			const hue = (time * 0.2 + offset * 0.05) % 1;
			const saturation = 1;
			const lightness = child.userData.isGlow ? 0.6 : 0.5;
			child.material.color.setHSL(hue, saturation, lightness);
		}
	});

	particles.rotation.y = time * 0.05;

	const positions = particles.geometry.attributes.position.array;
	for (let i = 0; i < positions.length; i += 3) {
		positions[i + 1] += Math.sin(time + positions[i]) * 0.001;
	}
	particles.geometry.attributes.position.needsUpdate = true;

	renderer.render(scene, camera);
}

renderer.domElement.addEventListener('mousedown', (e) => {
	mouseDown = true;
	mouseX = e.clientX;
	mouseY = e.clientY;
});

renderer.domElement.addEventListener('mousemove', (e) => {
	if (mouseDown) {
		const deltaX = e.clientX - mouseX;
		const deltaY = e.clientY - mouseY;

		targetRotationY += deltaX * 0.01;
		targetRotationX += deltaY * 0.01;

		mouseX = e.clientX;
		mouseY = e.clientY;
	}
});

renderer.domElement.addEventListener('mouseup', () => {
	mouseDown = false;
});

renderer.domElement.addEventListener('wheel', (e) => {
	e.preventDefault();
	camera.position.z += e.deltaY * 0.01;
	camera.position.z = Math.max(4, Math.min(15, camera.position.z));
});

let touchStartX = 0;
let touchStartY = 0;

renderer.domElement.addEventListener('touchstart', (e) => {
	touchStartX = e.touches[0].clientX;
	touchStartY = e.touches[0].clientY;
});

renderer.domElement.addEventListener('touchmove', (e) => {
	const deltaX = e.touches[0].clientX - touchStartX;
	const deltaY = e.touches[0].clientY - touchStartY;

	targetRotationY += deltaX * 0.01;
	targetRotationX += deltaY * 0.01;

	touchStartX = e.touches[0].clientX;
	touchStartY = e.touches[0].clientY;
});

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();