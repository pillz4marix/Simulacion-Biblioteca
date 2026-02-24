const firebaseConfig = {
    apiKey: "AIzaSyAvlxF7HL_w6Xu8sGAO7w8LFUZJPnXXZ5Y",
    authDomain: "bibliotecmi-a1c69.firebaseapp.com",
    databaseURL: "https://bibliotecmi-a1c69-default-rtdb.firebaseio.com", 
    projectId: "bibliotecmi-a1c69",
    storageBucket: "bibliotecmi-a1c69.firebasestorage.app",
    messagingSenderId: "45724842888",
    appId: "1:45724842888:web:01e98001138ae065ffd83d",
    measurementId: "G-8RNH7F15H9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let libros = [];
let usuarios = [];
let prestamos = [];
let userIdx = localStorage.getItem("userIdx");
let esAdmin = sessionStorage.getItem("esAdmin") === "true";
let editandoIndice = -1;
let tiempoInactividad;

db.ref('/').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        libros = data.libros || [];
        usuarios = data.usuarios || [];
        prestamos = data.prestamos || [];
        
        mostrarEstado();
        if (esAdmin) renderAdmin();
        if (userIdx !== null) {
            userIdx = parseInt(userIdx);
            mostrarPerfil();
        }
    }
});

const guardar = () => {
    db.ref('/').set({
        libros: libros,
        usuarios: usuarios,
        prestamos: prestamos
    }).then(() => {
        console.log("Sincronizado con BiblioTecmi Cloud");
    }).catch((error) => console.error("Error de conexión:", error));
};

// --- AUTENTICACIÓN Y REGISTRO ---

function registrarUsuario() {
    const nombre = document.getElementById("reg-nombre").value.trim();
    const pass = document.getElementById("reg-pass").value.trim();

    if (!nombre || !pass) return alert("Por favor completa todos los campos.");
    
    const existe = usuarios.find(u => u.nombre.toLowerCase() === nombre.toLowerCase());
    if (existe) return alert("Ese nombre de usuario ya existe.");

    usuarios.push({ nombre: nombre, password: pass });
    guardar();
    alert("¡Registro exitoso! Ya puedes iniciar sesión.");
    mostrarLoginUsuario();
}

function entrarComoUsuario() {
    const nombre = document.getElementById("login-nombre").value.trim();
    const pass = document.getElementById("login-pass-user").value.trim();

    const i = usuarios.findIndex(u => 
        u.nombre.toLowerCase() === nombre.toLowerCase() && 
        u.password === pass
    );

    if (i !== -1) {
        localStorage.setItem("userIdx", i);
        sessionStorage.setItem("esAdmin", "false");
        location.reload();
    } else { 
        alert("Usuario o contraseña incorrectos."); 
    }
}

function entrarComoAdmin() {
    if (document.getElementById("login-pass").value === "MaYa240625$") {
        sessionStorage.setItem("esAdmin", "true");
        localStorage.removeItem("userIdx");
        location.reload();
    } else { alert("Clave de administrador incorrecta."); }
}

function cambiarPassword() {
    const actual = document.getElementById("pass-actual").value;
    const nueva = document.getElementById("pass-nueva").value;

    if (usuarios[userIdx].password === actual) {
        if (nueva.length < 4) return alert("La nueva clave debe tener al menos 4 caracteres.");
        usuarios[userIdx].password = nueva;
        guardar();
        alert("Contraseña actualizada correctamente.");
        location.reload();
    } else {
        alert("La contraseña actual es incorrecta.");
    }
}

function salir() {
    sessionStorage.clear();
    localStorage.removeItem("userIdx");
    location.reload();
}

function reiniciarTemporizador() {
    if (userIdx === null && !esAdmin) return;
    clearTimeout(tiempoInactividad);
    const veinteMinutos = 20 * 60 * 1000;
    tiempoInactividad = setTimeout(() => {
        alert("Tu sesión ha expirado por inactividad.");
        salir();
    }, veinteMinutos);
}

function toggleMenu() { 
    document.getElementById("menu").classList.toggle("active"); 
}

function irA(seccion) {
    document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
    if (seccion === 'inicio') document.getElementById("vista-inicio").classList.remove("hidden");
    if (seccion === 'admin') {
        document.getElementById("seccion-bibliotecario").classList.remove("hidden");
        renderAdmin();
    }
    if (seccion === 'perfil') {
        document.getElementById("seccion-perfil").classList.remove("hidden");
        mostrarPerfil();
    }
    const menu = document.getElementById("menu");
    if(menu) menu.classList.remove("active");
}

function mostrarEstado() {
    const contenedor = document.getElementById("estado");
    if (!contenedor) return;
    contenedor.innerHTML = libros.map((l, i) => {
        const p = prestamos.find(pr => pr.l == i);
        const esMio = p && p.u == userIdx;
        const verFecha = (esMio || esAdmin) && !l.disponible && p;

        return `
            <div class="libro-card">
                <img src="${l.portada || 'https://via.placeholder.com/300x450?text=No+Image'}" class="libro-img">
                <div class="libro-info">
                    <span style="color:${l.disponible?'#22c55e':'#ef4444'}; font-size:0.7rem; font-weight:bold">
                        ● ${l.disponible ? 'DISPONIBLE' : 'PRESTADO'}
                    </span>
                    <h3 style="margin-top:5px">${l.titulo}</h3>
                    <p style="font-size:0.8rem; color:gray; margin-bottom: 10px;">${l.autor}</p>
                    <button class="btn-sinopsis" onclick="toggleSinopsis(${i})">Leer Sinopsis ↓</button>
                    <div id="sinopsis-${i}" class="sinopsis-desplegable" style="display:none; margin-top:10px; font-size:0.85rem; color:#ccc;">
                        ${l.sinopsis || 'Sin descripción.'}
                    </div>
                    ${verFecha ? `<p style="color:#fbbf24; font-size:0.75rem; margin-top:10px">Devolver: ${p.fecha}</p>` : ''}
                    <div style="margin-top:auto; padding-top:15px">
                        ${l.disponible ? `<button class="btn-primary" onclick="pedir(${i})">Solicitar</button>` : ''}
                        ${esMio ? `<button class="btn-primary" style="background:#6366f1; color:white" onclick="abrirLector(${i})">Leer Libro</button>` : ''}
                    </div>
                </div>
            </div>`;
    }).join('');
}

function toggleSinopsis(id) {
    const el = document.getElementById(`sinopsis-${id}`);
    el.style.display = (el.style.display === "block") ? "none" : "block";
}

function pedir(i) {
    if (esAdmin) return alert("El bibliotecario no solicita libros.");
    if (userIdx === null) return alert("Inicia sesión primero.");
    const misP = prestamos.filter(p => p.u == userIdx);
    if (misP.length >= 2) return alert("Límite: Solo puedes tener 2 libros.");

    const fechaLimit = new Date();
    fechaLimit.setDate(fechaLimit.getDate() + 14);

    libros[i].disponible = false;
    prestamos.push({ u: userIdx, l: i, fecha: fechaLimit.toLocaleDateString() });
    guardar();
}

function devolver(libroI) {
    prestamos = prestamos.filter(p => !(p.l == libroI && p.u == userIdx));
    if(libros[libroI]) libros[libroI].disponible = true;
    guardar();
}

function abrirLector(i) {
    localStorage.setItem("libroLeyendo", JSON.stringify(libros[i]));
    window.location.href = "lector.html";
}

function registrarLibro() {
    const t = document.getElementById("titulo").value.trim();
    const a = document.getElementById("autor").value.trim();
    const p = document.getElementById("portada").value;
    const s = document.getElementById("sinopsis").value.trim();
    const c = document.getElementById("contenido-libro").value.trim();

    if (!t || !c) return alert("Título y Contenido son obligatorios.");
    const datosLibro = { titulo: t, autor: a, portada: p, sinopsis: s, contenido: c, disponible: true };

    if (editandoIndice === -1) { libros.push(datosLibro); } 
    else { libros[editandoIndice] = datosLibro; editandoIndice = -1; }
    
    guardar();
    alert("¡Libro sincronizado!");
    document.querySelectorAll(".admin-form input, .admin-form textarea").forEach(i => i.value = "");
}

function renderAdmin() {
    document.getElementById("lista-libros-admin").innerHTML = libros.map((l, i) => `
        <div class="item-lista">
            <span onclick="cargarEdicion(${i})" style="cursor:pointer; color:#3b82f6;">${l.titulo}</span>
            <button class="btn-delete" onclick="borrarLibro(${i})">X</button>
        </div>`).join('');
    
    document.getElementById("lista-usuarios-admin").innerHTML = usuarios.map((u, i) => `
        <div class="item-lista"><span>${u.nombre}</span><button class="btn-delete" onclick="usuarios.splice(${i},1);guardar()">X</button></div>`).join('');

    const lP = document.getElementById("lista-prestamos-admin");
    lP.innerHTML = prestamos.length ? "" : "<p>No hay préstamos.</p>";
    prestamos.forEach((p, index) => {
        const u = usuarios[p.u]?.nombre || "Desconocido";
        const l = libros[p.l]?.titulo || "Eliminado";
        lP.innerHTML += `
            <div class="item-lista" style="border-left: 4px solid #3b82f6">
                <div><strong>${l}</strong><br><small>Poseedor: ${u}</small></div>
                <button class="btn-delete" style="background:#fbbf24" onclick="forzarDevolucion(${index})">Devolver</button>
            </div>`;
    });
}

function cargarEdicion(i) {
    const l = libros[i];
    editandoIndice = i;
    document.getElementById("titulo").value = l.titulo;
    document.getElementById("autor").value = l.autor;
    document.getElementById("portada").value = l.portada;
    document.getElementById("sinopsis").value = l.sinopsis;
    document.getElementById("contenido-libro").value = l.contenido;
    document.querySelector(".admin-main").scrollIntoView({ behavior: 'smooth' });
}

function borrarLibro(i) {
    if(confirm("¿Borrar libro?")) {
        libros.splice(i, 1);
        prestamos = prestamos.filter(p => p.l != i);
        guardar();
    }
}

function forzarDevolucion(idx) {
    const p = prestamos[idx];
    if(libros[p.l]) libros[p.l].disponible = true;
    prestamos.splice(idx, 1);
    guardar();
}

function mostrarPerfil() {
    const cont = document.getElementById("contenido-perfil");
    if (!cont || userIdx === null) return;
    document.getElementById("nombre-perfil").innerText = usuarios[userIdx]?.nombre || "";
    const misP = prestamos.filter(p => p.u == userIdx);
    cont.innerHTML = misP.length ? "" : "<p style='grid-column: 1/-1; text-align: center;'>No tienes libros actualmente.</p>";
    misP.forEach(p => {
        const l = libros[p.l];
        if(!l) return;
        cont.innerHTML += `
            <div class="libro-card">
                <img src="${l.portada}" class="libro-img">
                <div class="libro-info">
                    <h3>${l.titulo}</h3>
                    <button class="btn-primary" onclick="abrirLector(${p.l})">Leer</button>
                    <button class="btn-primary" style="background:#ef4444; margin-top:5px;" onclick="devolver(${p.l})">Devolver</button>
                </div>
            </div>`;
    });
}

function filtrarLibros() {
    const b = document.getElementById("buscador").value.toLowerCase();
    document.querySelectorAll(".libro-card").forEach(c => {
        const text = c.innerText.toLowerCase();
        c.style.display = text.includes(b) ? "flex" : "none";
    });
}

function mostrarRegistro() {
    document.getElementById("form-usuario").classList.add("hidden");
    document.getElementById("form-registro").classList.remove("hidden");
}

function mostrarLoginUsuario() {
    document.getElementById("form-usuario").classList.remove("hidden");
    document.getElementById("form-registro").classList.add("hidden");
    document.getElementById("form-admin").classList.add("hidden");
    document.getElementById("link-admin").classList.remove("hidden");
    document.getElementById("link-usuario").classList.add("hidden");
}

function mostrarLoginAdmin() {
    document.getElementById("form-usuario").classList.add("hidden");
    document.getElementById("form-registro").classList.add("hidden");
    document.getElementById("form-admin").classList.remove("hidden");
    document.getElementById("link-admin").classList.add("hidden");
    document.getElementById("link-usuario").classList.remove("hidden");
}

function procesarArchivo(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("portada").value = e.target.result;
            alert("Imagen cargada y optimizada.");
        };
        reader.readAsDataURL(input.files[0]);
    }
}

window.onload = () => {
    if (userIdx !== null || esAdmin) {
        document.getElementById("vista-login").classList.add("hidden");
        document.getElementById("main-nav").style.display = "flex";
        document.getElementById("vista-inicio").classList.remove("hidden");
        const m = document.getElementById("menu");
        m.innerHTML = esAdmin ? 
            `<li onclick="irA('inicio')">Catálogo</li><li onclick="irA('admin')">Admin</li><li onclick="salir()">Salir</li>` :
            `<li onclick="irA('inicio')">Catálogo</li><li onclick="irA('perfil')">Perfil</li><li onclick="salir()">Salir</li>`;
        
        reiniciarTemporizador();
    }
};

document.onmousemove = reiniciarTemporizador;
document.onkeydown = reiniciarTemporizador;
document.onclick = reiniciarTemporizador;
document.onscroll = reiniciarTemporizador;

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const id = document.activeElement.id;
        if (id === "login-nombre" || id === "login-pass-user") entrarComoUsuario();
        else if (id === "login-pass") entrarComoAdmin();
        else if (id === "reg-nombre" || id === "reg-pass") registrarUsuario();
    }
});
