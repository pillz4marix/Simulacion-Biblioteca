// Datos guardados en localStorage
let libros = JSON.parse(localStorage.getItem("libros")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let prestamos = JSON.parse(localStorage.getItem("prestamos")) || [];

function guardarDatos() {
    localStorage.setItem("libros", JSON.stringify(libros));
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("prestamos", JSON.stringify(prestamos));
}


function registrarLibro() {
    let titulo = document.getElementById("titulo").value.trim();
    let autor = document.getElementById("autor").value.trim();

    if (titulo && autor) {
        libros.push({ titulo, autor, disponible: true });
        guardarDatos();
        actualizarSelects();
        mostrarEstado();
        document.getElementById("titulo").value = "";
        document.getElementById("autor").value = "";
    }
}

// Registrar un usuario nuevo
function registrarUsuario() {
    let nombre = document.getElementById("nombreUsuario").value.trim();

    if (nombre) {
        usuarios.push({ nombre });
        guardarDatos();
        actualizarSelects();
        mostrarEstado();
        document.getElementById("nombreUsuario").value = "";
    }
}

// Realizar un prestamo
function realizarPrestamo() {
    let usuarioIndex = document.getElementById("selectUsuario").value;
    let libroIndex = document.getElementById("selectLibro").value;

    let librosPrestados = prestamos.filter(p => p.usuarioIndex == usuarioIndex).length;

    if (librosPrestados >= 2) {
        alert(`${usuarios[usuarioIndex].nombre} ya tiene 2 libros prestados. No puede tomar más.`);
        return;
    }

    if (!libros[libroIndex].disponible) {
        alert(`El libro "${libros[libroIndex].titulo}" ya está prestado.`);
        return;
    }

    libros[libroIndex].disponible = false;
    prestamos.push({ usuarioIndex, libroIndex });
    guardarDatos();
    actualizarSelects();
    mostrarEstado();
}

// Devolver libro
function devolverLibro() {
    let usuarioIndex = document.getElementById("selectUsuarioDevolver").value;
    let libroIndex = document.getElementById("selectLibroDevolver").value;

    let prestamoIndex = prestamos.findIndex(p => p.usuarioIndex == usuarioIndex && p.libroIndex == libroIndex);

    if (prestamoIndex === -1) {
        alert(`${usuarios[usuarioIndex].nombre} no tiene prestado ese libro.`);
        return;
    }

    libros[libroIndex].disponible = true;
    prestamos.splice(prestamoIndex, 1);
    guardarDatos();
    actualizarSelects();
    mostrarEstado();
}

// Eliminar libro
function eliminarLibro(index) {
    if (confirm(`¿Eliminar el libro "${libros[index].titulo}"?`)) {
        libros.splice(index, 1);
        prestamos = prestamos.filter(p => p.libroIndex != index);
        guardarDatos();
        actualizarSelects();
        mostrarEstado();
    }
}

// Eliminar usuario
function eliminarUsuario(index) {
    if (confirm(`¿Eliminar al usuario "${usuarios[index].nombre}"?`)) {
        usuarios.splice(index, 1);
        prestamos = prestamos.filter(p => p.usuarioIndex != index);
        guardarDatos();
        actualizarSelects();
        mostrarEstado();
    }
}

function toggleItem(element) {
    element.parentElement.classList.toggle("active");
}

// Actualizar los usuario y libros
function actualizarSelects() {
    let selectUsuario = document.getElementById("selectUsuario");
    let selectLibro = document.getElementById("selectLibro");
    let selectUsuarioDevolver = document.getElementById("selectUsuarioDevolver");
    let selectLibroDevolver = document.getElementById("selectLibroDevolver");

    selectUsuario.innerHTML = "";
    selectLibro.innerHTML = "";
    selectUsuarioDevolver.innerHTML = "";
    selectLibroDevolver.innerHTML = "";

    usuarios.forEach((usuario, index) => {
        selectUsuario.innerHTML += `<option value="${index}">${usuario.nombre}</option>`;
        selectUsuarioDevolver.innerHTML += `<option value="${index}">${usuario.nombre}</option>`;
    });

    libros.forEach((libro, index) => {
        if (libro.disponible) {
            selectLibro.innerHTML += `<option value="${index}">${libro.titulo}</option>`;
        }
        selectLibroDevolver.innerHTML += `<option value="${index}">${libro.titulo}</option>`;
    });
}

function mostrarEstado() {
    let estadoDiv = document.getElementById("estado");
    estadoDiv.innerHTML = "<strong>Libros:</strong><br><br>";

    libros.forEach((libro, index) => {
        estadoDiv.innerHTML += `
            <div class="item">
                <div class="item-header" onclick="toggleItem(this)">
                    <span>
                        ${libro.titulo} - ${libro.autor} (${libro.disponible ? "Disponible" : "Prestado"})
                    </span>
                    <span class="toggle">▾</span>
                </div>
                <div class="item-actions">
                    <button class="delete-btn" onclick="eliminarLibro(${index})">Eliminar libro</button>
                </div>
            </div>
        `;
    });

    estadoDiv.innerHTML += "<br><strong>Usuarios:</strong><br><br>";

    usuarios.forEach((usuario, index) => {
        // Obtener libros prestados por este usuario
        let librosDelUsuario = prestamos
            .filter(p => p.usuarioIndex == index)
            .map(p => libros[p.libroIndex]?.titulo || "Libro eliminado");

        estadoDiv.innerHTML += `
            <div class="item">
                <div class="item-header" onclick="toggleItem(this)">
                    <span>
                        ${usuario.nombre} (${librosDelUsuario.length} libros prestados: ${librosDelUsuario.join(", ")})
                    </span>
                    <span class="toggle">▾</span>
                </div>
                <div class="item-actions">
                    <button class="delete-btn" onclick="eliminarUsuario(${index})">Eliminar usuario</button>
                </div>
            </div>
        `;
    });
}
