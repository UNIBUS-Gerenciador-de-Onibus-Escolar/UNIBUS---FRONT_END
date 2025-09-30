import Constants from "expo-constants";

const extras =
  // expo SDKs diferentes expõem em campos diferentes. tentamos os mais comuns:
  (Constants.expoConfig && Constants.expoConfig.extra) ||
  (Constants.manifest && Constants.manifest.extra) ||
  (Constants.manifest2 && Constants.manifest2.extra) ||
  {};

<<<<<<< HEAD
const API_HOST = extras.API_HOST || "192.168.0.105"; // seu IP fixo
=======
const API_HOST = extras.API_HOST || "172.20.10.3"; // seu IP fixo
>>>>>>> de014f1 (cadastro da gestão e o card das rotas)
const API_PORT = extras.API_PORT || "5000";
const ENV = extras.ENV || "development";

// 🔥 sempre vai usar o IP da sua máquina
export const API_URL = `http://${API_HOST}:${API_PORT}`;

