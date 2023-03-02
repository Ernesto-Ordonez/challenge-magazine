import ColorThief from './color-thief.mjs'

console.log("Script conectado");

addEventListener('DOMContentLoaded', main())

function main() {
    // Inicializar una instancia de ColorThief (API para determinar
    // el color principal de una imagen/paletas de colores)
    // https://lokeshdhakar.com/projects/color-thief/
    const colorThief = new ColorThief();

    // Recibe un array rgb, le da formato y lo asigna al contenedor del issue
    // (se podria separar en dos funciones)
    function setColor(target, array) {
        const [r, g, b] = array;
        const formattedColor = `rgb(${r}, ${g}, ${b})`;
        target.parentElement.style = `background-color: ${formattedColor}`;
    }

    // Declaramos nuestro observer para determinar que issue esta
    // en pantalla y asi poder cambiar el color
    // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    const observerOptions = {
        root: document.querySelector("#issue--container"),
        rootMargin: "0px",
        threshold: 0.5
    }

    const ob = new IntersectionObserver(observerCallback, observerOptions);

    function observerCallback(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.children[0]
                if (img.complete) {
                        // Si la imagen esta cargada, tomar el color
                        const newColorArray = colorThief.getColor(img);
                        setColor(entry.target, newColorArray);
                        console.log("Seteando color en observer:", newColorArray)
                    } else {
                        // Sino deja el eventListener para cuando termine
                        img.addEventListener('load', function() {
                            const newColorArray = colorThief.getColor(img);
                            setColor(entry.target, newColorArray);
                            console.log("Seteando color en observer:", newColorArray)
                        });
                    }
            }
        })

    }

    // Le aplicamos el observer a todos los issues
    document.querySelectorAll(".issue").forEach((i) => {
        ob.observe(i)
    })
}


