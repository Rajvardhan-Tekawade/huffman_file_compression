import { useCallback, useEffect, useState } from "react";
import Particles from "@tsparticles/react";
import { initParticlesEngine } from "@tsparticles/react"; // This will allow you to initialize the engine
import type { Container, Engine } from "@tsparticles/engine";
import { loadFull } from "tsparticles"; // Load the full tsparticles library
import { loadSlim } from "@tsparticles/slim"; // Optional, for slim particles

const Design: React.FC = () => {
    const [init, setInit] = useState(false);

    // This should be run only once per application lifetime
    useEffect(() => {
        const initializeParticles = async () => {
            // Initialize the tsParticles engine
            await initParticlesEngine(async (engine: Engine) => {
                await loadFull(engine); // Load all particles features
                // You can uncomment the following line if you need the slim version too
                // await loadSlim(engine);
            });
            setInit(true); // Set initialization complete
        };

        initializeParticles(); // Call the function
    }, []);

    const particlesLoaded = useCallback((container: Container) => {
        console.log(container); // Log the container when loaded
    }, []);

    return (
        <>
            {init && (
                <Particles
                    id="tsparticles"
                    particlesLoaded={particlesLoaded}
                    options={{
                        background: {
                            color: {
                                value: "transparent",
                            },
                        },
                        fpsLimit: 120, // Limit the frame rate
                        interactivity: {
                            events: {
                                onClick: {
                                    enable: true,
                                    mode: "push", // Push particles on click
                                },
                                onHover: {
                                    enable: true,
                                    mode: "repulse", // Repulse particles on hover
                                },
                                resize: true,
                            },
                            modes: {
                                push: {
                                    quantity: 4, // Number of particles to push
                                },
                                repulse: {
                                    distance: 200, // Distance to repulse
                                    duration: 0.4, // Duration of repulse effect
                                },
                            },
                        },
                        particles: {
                            color: {
                                value: "#ffffff", // Particle color
                            },
                            links: {
                                color: "#ffffff", // Link color between particles
                                distance: 150, // Link distance
                                enable: true,
                                opacity: 0.5,
                                width: 1,
                            },
                            move: {
                                direction: "none",
                                enable: true,
                                outModes: {
                                    default: "bounce", // Behavior on leaving the canvas
                                },
                                random: false,
                                speed: 6, // Speed of particle movement
                                straight: false,
                            },
                            number: {
                                density: {
                                    enable: true,
                                    area: 800, // Density area
                                },
                                value: 80, // Number of particles
                            },
                            opacity: {
                                value: 0.5, // Particle opacity
                            },
                            shape: {
                                type: "circle", // Shape of particles
                            },
                            size: {
                                value: { min: 1, max: 5 }, // Size range for particles
                            },
                        },
                        detectRetina: true, // Enable retina detection
                    }}
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        top: 0,
                        left: 0,
                        zIndex: 1, // Ensure particles are above the background
                    }}
                />
            )}
        </>
    );
};

export default Design;
