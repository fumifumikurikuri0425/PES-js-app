import * as d3 from "d3";

const colorMaps = {
  Inferno: d3.interpolateInferno,
  Magma: d3.interpolateMagma,
  Plasma: d3.interpolatePlasma,
  Cividis: d3.interpolateCividis,
  Warm: d3.interpolateWarm,
  Cool: d3.interpolateCool,
  CubehelixDefault: d3.interpolateCubehelixDefault,
  Rainbow: d3.interpolateRainbow,
  Sinebow: d3.interpolateSinebow,
  Turbo: d3.interpolateTurbo,
  Greys: d3.interpolateGreys,
  Spectral: d3.interpolateSpectral,
  RdYlBu: d3.interpolateRdYlBu,
};

export default colorMaps;
