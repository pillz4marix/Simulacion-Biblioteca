let libros = [];
let usuarios = [];

// -------------------- REGISTRAR LIBRO --------------------
function registrarLibro() {
    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;

    if (titulo === "" || autor === "") {
        alert("Completa todos los campos.");
        return;
    }

    libros.push({
        titulo: titulo,
        autor: autor,
        disponible: true
    });

    document.getElementById("titulo").value = "";
    document.getElementById("autor").value = "";

    actualizarSelects();
    mostrarEstado();
}

// -------------------- REGISTRAR USUARIO --------------------
function registrarUsuario() {
    const nombre = document.getElementById("nombreUsuario").value;

    if (nombre === "") {
        alert("Ingresa un nombre.");
        return;
    }

    usuarios.push({
        nombre: nombre,
        prestamos: 0
    });

    document.getElementById("nombreUsuario").value = "";

    actualizarSelects();
    mostrarEstado();
}

// -------------------- REALIZAR PRÉSTAMO --------------------
function realizarPrestamo() {
    const indexUsuario = document.getElementById("selectUsuario").value;
    const indexLibro = document.getElementById("selectLibro").value;

    if (indexUsuario === "" || indexLibro === "") {
        alert("Selecciona usuario y libro.");
        return;
    }

    let usuario = usuarios[indexUsuario];
    let libro = libros[indexLibro];

    if (!libro.disponible) {
        alert("El libro no está disponible.");
        return;
    }

    if (usuario.prestamos >= 2) {
        alert("El usuario alcanzó el límite de préstamos.");
        return;
    }

    libro.disponible = false;
    usuario.prestamos++;

    mostrarEstado();
}

// -------------------- DEVOLVER LIBRO --------------------
function devolverLibro() {
    const indexUsuario = document.getElementById("selectUsuarioDevolver").value;
    const indexLibro = document.getElementById("selectLibroDevolver").value;

    if (indexUsuario === "" || indexLibro === "") {
        alert("Selecciona usuario y libro.");
        return;
    }

    let usuario = usuarios[indexUsuario];
    let libro = libros[indexLibro];

    if (libro.disponible) {
        alert("El libro ya está disponible.");
        return;
    }

    if (usuario.prestamos > 0) {
        libro.disponible = true;
        usuario.prestamos--;
        mostrarEstado();
    } else {
        alert("El usuario no tiene préstamos.");
    }
}

// -------------------- ACTUALIZAR SELECTS --------------------
function actualizarSelects() {
    let selectUsuario = document.getElementById("selectUsuario");
    let selectLibro = document.getElementById("selectLibro");
    let selectUsuarioDev = document.getElementById("selectUsuarioDevolver");
    let selectLibroDev = document.getElementById("selectLibroDevolver");

    selectUsuario.innerHTML = "";
    selectLibro.innerHTML = "";
    selectUsuarioDev.innerHTML = "";
    selectLibroDev.innerHTML = "";

    usuarios.forEach((u, index) => {
        selectUsuario.innerHTML += `<option value="${index}">${u.nombre}</option>`;
        selectUsuarioDev.innerHTML += `<option value="${index}">${u.nombre}</option>`;
    });

    libros.forEach((l, index) => {
        selectLibro.innerHTML += `<option value="${index}">${l.titulo}</option>`;
        selectLibroDev.innerHTML += `<option value="${index}">${l.titulo}</option>`;
    });
}

// -------------------- MOSTRAR ESTADO --------------------
function mostrarEstado() {
    let estado = document.getElementById("estado");
    estado.innerHTML = "<strong>Libros:</strong><br>";

    libros.forEach(l => {
        estado.innerHTML += `${l.titulo} - ${l.disponible ? "Disponible" : "Prestado"}<br>`;
    });

    estado.innerHTML += "<br><strong>Usuarios:</strong><br>";

    usuarios.forEach(u => {
        estado.innerHTML += `${u.nombre} - Préstamos: ${u.prestamos}<br>`;
    });
}
