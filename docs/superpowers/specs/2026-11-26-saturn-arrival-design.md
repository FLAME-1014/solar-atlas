# Saturn Arrival Design

## Intent

Give first-time visitors a direct, immersive route to Saturn, featuring an unmistakable change in the apparent width and angle of the existing Saturn ring. Preserve the existing dark astronomical atlas and allow visitors to take control as soon as the camera settles.

## Audience and success

Visitors without prior knowledge of Solar Atlas should be able to start toward Saturn from the first screen, recognize the ring from wide context, see it approach and turn to an edge-on angle, and continue freely without exceeding a three-minute hard limit. Visitors using reduced motion or a no-WebGL browser can still reach Saturn and understand their controls.

## Selected approach

Reuse the existing three-dimensional Solar Atlas scene and controls for a brief, self-timed camera tour: an initial wide composition with the ring already visible, one close approach, and one turn to an approximately five-degree edge view. Measure the ring against the usable viewport at desktop and mobile sizes. Hide peripheral interface during the tour, announce its phase accessibly, provide a visible skip and escape path, then return camera control without resetting the final framing. Open the Saturn archive only on request.

Preserve the welcome heading, star-map appearance, English language mode, and a separate free-exploration action. The physics-based flight simulator remains independently available.

## States and fallback

- The existing first-screen primary action starts the Saturn route directly; keyboard activation preserves normal focused-button behavior.
- Tour phases are approach, edge, and arrived; pressing skip, Escape, or directly manipulating the canvas restores control.
- Respect `prefers-reduced-motion` and the existing in-app reduce-motion setting: show a fixed Saturn composition immediately and offer explicit manual ring-angle choices.
- The Canvas 2D compatibility view draws and frames Saturn directly. Bundle-load recovery opens the Saturn section of the text catalogue. A context loss during the route preserves the selected Saturn destination and moves to the static compatibility composition.

## Boundaries

Do not change physics or relabel the six-hour-plus real-scale Saturn trip as instantaneous flight. Do not modify unrelated scene controls, product data, assets, or existing uncommitted changes. Keep reduced-motion and no-WebGL explanations truthful; the fallback composition is a static map, not the 3D simulator.

## Verification

Exercise desktop and mobile viewport rendering, the ring's projected scale throughout the transition, skip and first-touch camera ownership, keyboard activation, reduced-motion manual views, the 2D no-WebGL destination, context-loss handover, and direct Saturn text recovery after the app bundle fails. The route must settle in seconds, within three minutes, without a forced wait or clipped ring.
