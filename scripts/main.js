import ColorThief from "./color-thief.mjs";
import rgbToComplementary from "./complementary.mjs";

console.log("Script conectado");

addEventListener("DOMContentLoaded", main());

function main() {
  // Inicializar una instancia de ColorThief (API para determinar
  // el color principal de una imagen/paletas de colores)
  // https://lokeshdhakar.com/projects/color-thief/
  const colorThief = new ColorThief();
  const container = document.querySelector("#issue--container");

  function formatRgbColor(array) {
    const [r, g, b] = array;
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Recibe un array rgb, le da formato y lo asigna al contenedor del issue
  function setColor(target, array) {
    const newColor = formatRgbColor(array);
    const newComplementary = formatRgbColor(rgbToComplementary(array));
    console.log("Color complementario de", newColor, ":", newComplementary);
    container.style = `background-color: ${newColor}`;
    target.nextElementSibling.style = `--fill-color: ${newComplementary}`;
  }

  // Declaramos nuestro observer para determinar que issue esta
  // en pantalla y asi poder cambiar el color
  // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
  const observerOptions = {
    root: document.querySelector("#issue--container"),
    rootMargin: "0px",
    threshold: 0.5,
    delay: 100,
  };

  const ob = new IntersectionObserver(observerCallback, observerOptions);

  function observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // En primer lugar determinamos el color del fondo
        const img = entry.target;
        const navLinks = document.querySelectorAll(".nav--link");

        if (img.complete) {
          // Si la imagen esta cargada, tomar el color
          const newColorArray = colorThief.getColor(img);
          setColor(img, newColorArray);
          setTextColor(document.querySelector("body"), newColorArray);
          console.log("Seteando color en observer:", newColorArray);
        } else {
          // Sino deja el eventListener para cuando termine
          img.addEventListener("load", function () {
            const newColorArray = colorThief.getColor(img);
            setColor(img, newColorArray);
            setTextColor(document.querySelector("body"), newColorArray);
            console.log("Seteando color en observer:", newColorArray);
          });
        }

        // En segundo lugar resaltamos el link de la nav
        navLinks.forEach((item) => {
          const href = item.href.slice(item.href.indexOf("#") + 1);
          if (href === img.parentElement.parentElement.id) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      }
    });
  }

  // Le aplicamos el observer a todos los issues
  document.querySelectorAll(".issue--cover").forEach((i) => {
    ob.observe(i);
  });

  function setTextColor(target, array) {
    // if (red*0.299 + green*0.587 + blue*0.114) > 186 use #000000 else use #ffffff
    const logo = document.getElementById("logo");
    logo.fill = "red";
    if (array[0] * 0.299 + array[1] * 0.587 + array[2] * 0.114 > 150) {
      target.classList.add("black");
      target.classList.remove("white");
    } else {
      target.classList.add("white");
      target.classList.remove("black");
    }
  }
}
