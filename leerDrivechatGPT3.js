import fetch from 'node-fetch';

// const fileUrl = "https://drive.google.com/uc?export=download&id=1JKSJUykO-eQXi85B2F_LwleLDLtA23e-";
// problema se debe a que estás utilizando una combinación de async/await y then/catch en tu función obtenerJsonEn esta versión, se utiliza await tanto para obtener la respuesta del fetch como para convertirla en JSON. 

export const obtenerJson = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl);
    const jsonData = await response.json();
    console.log('salida es:',jsonData)
    return jsonData;
  } catch (error) {
    console.error('Error al obtener el archivo:', error);
    throw error;
  }
};
// const fileUrl = "https://drive.google.com/uc?export=download&id=1JKSJUykO-eQXi85B2F_LwleLDLtA23e-";
// obtenerJson(fileUrl)

// export const obtenerJson = async (fileUrl)=>{
//   fetch(fileUrl)
//     .then(response => response.json())
//     .then(jsonData => {
//       // Aquí puedes utilizar la variable jsonData que contiene el JSON
//       // console.log(jsonData);
//       return jsonData
//       // Continúa con el procesamiento de los datos JSON según tus necesidades
//     })
//     .catch(error => {
//       console.error('Error al obtener el archivo:', error);
//     });
// }
  
