var modelo = null;
var imageArray = null; 

(async() => {
    console.log("Cargando modelo...");
    modelo = await tf.loadLayersModel("model.json");
    console.log("Modelo cargado");

})();

function handleImage(e) {

    const input = e.target;
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');

                // Escalar la imagen a 180x180
                const scaledWidth = 180;
                const scaledHeight = 180;
                canvas.width = scaledWidth;
                canvas.height = scaledHeight;

                ctx.clearRect(0, 0, scaledWidth, scaledHeight);

                ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

                // Obtener los datos de la imagen como arreglo
                const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight).data;

                // Convertir los datos de la imagen a un arreglo tridimensional (180x180x3)
                imageArray = new Array(scaledHeight).fill(null).map(() => new Array(scaledWidth).fill(null).map(() => new Array(3).fill(0)));
                for (let i = 0; i < scaledWidth * scaledHeight * 4; i += 4) {
                    const x = (i / 4) % scaledWidth;
                    const y = Math.floor((i / 4) / scaledWidth);

                    imageArray[y][x][0] = imageData[i]/255;
                    imageArray[y][x][1] = imageData[i + 1]/255;
                    imageArray[y][x][2] = imageData[i + 2]/255;
                }

                document.getElementById('lab_img').innerHTML = "CAMBIAR IMAGEN"

                //console.log(imageArray);

                if (modelo != null){

                    var tensor = tf.tensor4d([imageArray]);
                    var resultado = modelo.predict(tensor).dataSync();
                    console.log(resultado)
                    var maximo= Math.max(...resultado);
                    console.log(maximo)

                    // Obtenemos el índice del valor máximo usando indexOf
                    const indiceMaximo = resultado.indexOf(maximo);
                    const recomend = document.getElementById('recomend')

                    if (indiceMaximo==0){
                        document.getElementById('diagnostico').innerHTML = "Cálculos renales"
                        recomend.innerHTML = "<b>Acciones y Tratamientos Sugeridos:</b><br>1.Modificaciones Dietéticas: Se puede ajustar la dieta del perro para prevenir la formación de cálculos y promover su eliminación.<br>2.Hidratación Adecuada: Incrementar la ingesta de agua es esencial para facilitar la expulsión de los cálculos y mejorar la función renal.<br>3.Tratamiento Farmacológico: Se pueden administrar medicamentos específicos diseñados para disolver o reducir el tamaño de los cálculos.<br>4.Intervención Quirúrgica: En situaciones más graves o cuando otras opciones no son efectivas, se puede considerar la cirugía como último recurso."
                    } else if (indiceMaximo==1){
                        document.getElementById('diagnostico').innerHTML = "Nefropatía de aspecto crónico"
                        recomend.innerHTML = "<b>Acciones y Tratamientos Recomendados:</b><br>1.Control Farmacológico: La administración de fármacos dirigidos a regular la presión arterial puede ser esencial para mitigar el avance de la enfermedad.<br>2.Dieta Específica: Una alimentación controlada en proteínas puede ayudar a reducir la carga renal y minimizar el deterioro adicional.<br>3.Hidratación Optimizada: Mantener una hidratación adecuada es fundamental para apoyar la función renal y prevenir complicaciones.<br>4.Gestión de Enfermedades Subyacentes: Tratar cualquier otra condición médica presente que pueda contribuir o exacerbar la nefropatía.<br>5.Terapia Renal de Apoyo: La terapia, como la infusión de líquidos intravenosos, puede ser necesaria para mantener la función renal."
                    } else {
                        document.getElementById('diagnostico').innerHTML = "Riñones sanos"
                        recomend.innerHTML = ""
                    }

                    recomend.style.width = "400px"

                    console.log(indiceMaximo)
                }
            };
        };

        reader.readAsDataURL(input.files[0]);
    }

    return imageArray
}

document.getElementById('imagenInput').addEventListener('click', handleImage);
