// Reconstructed demo preset inferred from PlanetScene.ts; not a recovered upstream original.
export const PLANET_SCENE_DEFAULTS = {
  ambientStrength: 0.16,
  sunColor: '#fff0d1',
  sphere1FogDensity: 3.5,
  sphere1AtmosphereAltitude: 0.22,
  sphere1FalloffPower: 2.0,
  sphere1MultiScatterBoost: 0.35,
  sphere1PhaseG: 0.4,
  sphere1RayleighStrength: 1.1,
  sphere1MieStrength: 0.25,
  sphere1RayleighColor: '#4b8eff',
  sphere1MieColor: '#ffc388',
  sphere2FogDensity: 3.0,
  sphere2AtmosphereAltitude: 0.2,
  sphere2FalloffPower: 2.2,
  sphere2MultiScatterBoost: 0.25,
  sphere2PhaseG: 0.35,
  sphere2RayleighStrength: 0.95,
  sphere2MieStrength: 0.2,
  sphere2RayleighColor: '#9c70ff',
  sphere2MieColor: '#ff8ab4'
};

export type PlanetSceneParameters = typeof PLANET_SCENE_DEFAULTS;
