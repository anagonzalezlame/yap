# Yap

Yap es un dashboard interactivo que monitorea el tráfico marítimo frente a la costa de Ciudad Vieja en tiempo real. El sistema se conecta a la red AIS mediante WebSockets, procesa el flujo de datos para filtrar las embarcaciones que ingresan a unas coordenadas específicas y expone esa información en una interfaz visual limpia.

El proyecto separa la captura de datos de la presentación gráfica. El backend en Java se encarga de mantener la conexión activa, parsear las respuestas JSON entrantes y aplicar la lógica de filtrado geoespacial para el radio de 200 metros. Luego, el frontend toma esos datos refinados para ubicarlos en el mapa con un diseño cuidado, mostrando identificadores, rutas y velocidades de cada barco.

## Características principales

* **Conexión persistente:** Consumo de datos en vivo a través de WebSockets sin necesidad de recargar la interfaz.
* **Filtrado por coordenadas:** Lógica de bounding box para descartar el tráfico global y renderizar exclusivamente la zona de interés.
* **Interfaz minimalista:** Presentación visual condensada que prioriza la claridad de la información logística y de navegación.

## Stack Tecnológico

* **Backend:** Java (lógica de conexión, deserialización de JSON y filtrado espacial).
* **Frontend:** HTML, CSS, JavaScript (integración de mapas y actualización del DOM).
* **Datos:** API de AIS en tiempo real.
