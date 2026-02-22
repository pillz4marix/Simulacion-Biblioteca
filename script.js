let libros = JSON.parse(localStorage.getItem("libros")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let prestamos = JSON.parse(localStorage.getItem("prestamos")) || [];
let userIdx = localStorage.getItem("userIdx");
let esAdmin = sessionStorage.getItem("esAdmin") === "true";

const guardar = () => {
    localStorage.setItem("libros", JSON.stringify(libros));
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("prestamos", JSON.stringify(prestamos));
};

function entrarComoUsuario() {
    const nombre = document.getElementById("login-nombre").value.trim();
    const i = usuarios.findIndex(u => u.nombre.toLowerCase() === nombre.toLowerCase());
    if (i !== -1) {
        localStorage.setItem("userIdx", i);
        sessionStorage.setItem("esAdmin", "false");
        location.reload();
    } else { alert("Usuario no encontrado."); }
}

function entrarComoAdmin() {
    if (document.getElementById("login-pass").value === "1234") {
        sessionStorage.setItem("esAdmin", "true");
        localStorage.removeItem("userIdx");
        location.reload();
    } else { alert("Clave incorrecta."); }
}

function salir() {
    sessionStorage.clear();
    localStorage.removeItem("userIdx");
    location.reload();
}

function toggleMenu() { document.getElementById("menu").classList.toggle("active"); }

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
    if(document.getElementById("menu").classList.contains("active")) toggleMenu();
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
                    <p style="font-size:0.8rem; color:var(--muted); margin-bottom: 10px;">${l.autor}</p>
                    
                    <button class="btn-sinopsis" onclick="toggleSinopsis(${i})">Leer Sinopsis ↓</button>
                    <div id="sinopsis-${i}" class="sinopsis-desplegable">
                        ${l.sinopsis || 'Sin descripción disponible.'}
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
    const btn = el.previousElementSibling;
    
    if (el.style.display === "block") {
        el.style.display = "none";
        btn.innerText = "Leer Sinopsis ↓";
    } else {
        el.style.display = "block";
        btn.innerText = "Cerrar Sinopsis ↑";
    }
}

function abrirLector(i) {
    localStorage.setItem("libroLeyendo", JSON.stringify(libros[i]));

    localStorage.setItem("libroIDActual", libros[i].titulo); 
    
    window.location.href = "lector.html";
}

function pedir(i) {
    if (esAdmin) return alert("El bibliotecario no tiene permitido solicitar libros.");
    if (userIdx === null) return alert("Inicia sesión primero.");
    const misP = prestamos.filter(p => p.u == userIdx);
    if (misP.length >= 2) return alert("Límite: Solo puedes tener 2 libros.");

    const fechaLimit = new Date();
    fechaLimit.setDate(fechaLimit.getDate() + 14);

    libros[i].disponible = false;
    prestamos.push({ u: userIdx, l: i, fecha: fechaLimit.toLocaleDateString() });
    guardar();
    mostrarEstado();
}

function cargarEdicion(i) {
    const l = libros[i];
    editandoIndice = i;

    document.getElementById("titulo").value = l.titulo;
    document.getElementById("autor").value = l.autor;
    document.getElementById("portada").value = l.portada;
    document.getElementById("sinopsis").value = l.sinopsis;
    document.getElementById("contenido-libro").value = l.contenido;

    const btn = document.querySelector(".admin-form button");
    btn.innerText = "Actualizar Cambios del Libro";
    btn.style.background = "var(--warning)";

    document.querySelector(".admin-main").scrollIntoView({ behavior: 'smooth' });
}

function registrarLibro() {
    const t = document.getElementById("titulo").value.trim();
    const a = document.getElementById("autor").value.trim();
    const p = document.getElementById("portada").value;
    const s = document.getElementById("sinopsis").value.trim();
    const c = document.getElementById("contenido-libro").value.trim();

    if (!t || !c) return alert("Título y Contenido son obligatorios.");

 const datosLibro = { titulo: t, autor: a, portada: p, sinopsis: s, contenido: c, disponible: true };

    try {
        if (editandoIndice === -1) {
            libros.push(datosLibro);
        } else {
            libros[editandoIndice] = datosLibro;
            editandoIndice = -1;
        }
        guardar(); 
        alert("¡Libro guardado con éxito!");
        location.reload();
    } catch (e) {
        alert("⚠️ ¡MEMORIA LLENA! No se pudo guardar el libro porque la imagen es muy grande. Borra otros libros o usa una imagen más pequeña.");
        console.log(e);
    }
}

function registrarUsuario() {
    const n = document.getElementById("nombreUsuario").value;
    if (n) { usuarios.push({ nombre: n }); guardar(); renderAdmin(); }
}
let editandoIndice = -1;
function renderAdmin() {
    document.getElementById("lista-libros-admin").innerHTML = libros.map((l, i) => `
        <div class="item-lista">
            <span onclick="cargarEdicion(${i})" style="cursor:pointer; color:var(--primary); text-decoration:underline;">
                ${l.titulo}
            </span>
            <button class="btn-delete" onclick="borrarLibro(${i})">X</button>
        </div>
    `).join('');
    
    document.getElementById("lista-usuarios-admin").innerHTML = usuarios.map((u, i) => `
        <div class="item-lista"><span>${u.nombre}</span><button class="btn-delete" onclick="usuarios.splice(${i},1);guardar();renderAdmin()">X</button></div>
    `).join('');

    const lP = document.getElementById("lista-prestamos-admin");
    lP.innerHTML = prestamos.length ? "" : "<p style='color:gray'>No hay préstamos activos.</p>";
    prestamos.forEach((p, index) => {
        const u = usuarios[p.u]?.nombre || "Desconocido";
        const l = libros[p.l]?.titulo || "Libro eliminado";
        lP.innerHTML += `
            <div class="item-lista" style="border-left: 4px solid var(--primary)">
                <div><strong>${l}</strong><br><small>Poseedor: ${u}</small></div>
                <button class="btn-delete" style="background:var(--warning)" onclick="forzarDevolucion(${index})">Devolver</button>
            </div>`;
    });
}

function forzarDevolucion(idx) {
    if(confirm("¿Desea quitarle este libro al usuario?")) {
        const p = prestamos[idx];
        if(libros[p.l]) libros[p.l].disponible = true;
        prestamos.splice(idx, 1);
        guardar(); renderAdmin(); mostrarEstado();
    }
}

function borrarLibro(i) {
    if(confirm("¿Borrar libro? Los préstamos asociados se perderán.")) {
        libros.splice(i, 1);
        prestamos = prestamos.filter(p => p.l != i).map(p => {
            if(p.l > i) p.l--;
            return p;
        });
        
        guardar();
        renderAdmin();
        mostrarEstado();
    }
}

function mostrarPerfil() {
    const cont = document.getElementById("contenido-perfil");
    const misP = prestamos.filter(p => p.u == userIdx);
    cont.innerHTML = misP.length ? "" : "<p style='grid-column:1/-1; text-align:center'>No tienes libros actualmente.</p>";
    misP.forEach(p => {
        const l = libros[p.l];
        if(!l) return;
        cont.innerHTML += `
            <div class="libro-card">
                <img src="${l.portada}" class="libro-img">
                <div class="libro-info">
                    <h3>${l.titulo}</h3>
                    <p style="color:#fbbf24">Límite: ${p.fecha}</p>
                    <div style="margin-top:10px">
                         <button class="btn-primary" style="background:#6366f1; color:white; margin-bottom:5px" onclick="abrirLector(${p.l})">Leer Libro</button>
                         <button class="btn-primary" style="background:var(--danger); color:white" onclick="devolver(${p.l})">Devolver</button>
                    </div>
                </div>
            </div>`;
    });
}

function devolver(libroI) {
    prestamos = prestamos.filter(p => !(p.l == libroI && p.u == userIdx));
    if(libros[libroI]) libros[libroI].disponible = true;
    guardar(); mostrarPerfil(); mostrarEstado();
}

function filtrarLibros() {
    const b = document.getElementById("buscador").value.toLowerCase();
    document.querySelectorAll(".libro-card").forEach(c => {
        const t = c.querySelector("h3").innerText.toLowerCase();
        const a = c.querySelector("p").innerText.toLowerCase();
        c.style.display = (t.includes(b) || a.includes(b)) ? "flex" : "none";
    });
}

window.onload = () => {
    if (userIdx !== null || esAdmin) {
        document.getElementById("vista-login").classList.add("hidden");
        document.getElementById("main-nav").style.display = "flex";
        document.getElementById("vista-inicio").classList.remove("hidden");
        const m = document.getElementById("menu");
        m.innerHTML = esAdmin ? 
            `<li onclick="irA('inicio')">Catálogo</li><li onclick="irA('admin')">Admin</li><li onclick="salir()">Salir</li>` :
            `<li onclick="irA('inicio')">Catálogo</li><li onclick="irA('perfil')">Mis Libros</li><li onclick="salir()">Salir</li>`;
        mostrarEstado();
    }
};

function mostrarLoginAdmin() { 
    document.getElementById("form-usuario").classList.add("hidden"); 
    document.getElementById("form-admin").classList.remove("hidden"); 
    document.getElementById("link-admin").classList.add("hidden"); 
    document.getElementById("link-usuario").classList.remove("hidden"); 
}

function procesarArchivo(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const escala = 400 / img.width;
                canvas.width = 400;
                canvas.height = img.height * escala;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const fotoComprimida = canvas.toDataURL('image/jpeg', 0.6);
                
                document.getElementById("portada").value = fotoComprimida;
                if(document.getElementById("previsualizacion")) {
                    document.getElementById("previsualizacion").src = fotoComprimida;
                    document.getElementById("previsualizacion").style.display = "block";
                }
                alert("Imagen optimizada y lista para guardar.");
            };
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function mostrarLoginUsuario() { 
    document.getElementById("form-usuario").classList.remove("hidden"); 
    document.getElementById("form-admin").classList.add("hidden"); 
    document.getElementById("link-admin").classList.remove("hidden"); 
    document.getElementById("link-usuario").classList.add("hidden"); 
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const inputUsuario = document.getElementById("login-nombre");
        const inputAdmin = document.getElementById("login-pass");

        if (document.activeElement === inputUsuario) {
            entrarComoUsuario();
        } 

        else if (document.activeElement === inputAdmin) {
            entrarComoAdmin();
        }

        const inputTitulo = document.getElementById("titulo");
        if (document.activeElement === inputTitulo || document.activeElement === document.getElementById("autor")) {
            document.getElementById("portada").focus();
        }
    }
});