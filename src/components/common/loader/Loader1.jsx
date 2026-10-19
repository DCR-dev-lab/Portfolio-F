import styled from 'styled-components';

const LETTERS = [
    {
        key: 'D',
        grad: 'url(#grad1)',
        d: 'M 8,4 h 15 c 15,0 28,10 28,28 c 0,18 -13,28 -28,28 h -15 z',
        className: 'dash'
    },
    {
        key: 'C',
        grad: 'url(#grad2)',
        d: 'M 32 32 m 0 -27 a 27 27 0 1 1 0 54 a 27 27 0 1 1 0 -54',
        className: 'spin'
    },
    {
        key: 'R',
        grad: 'url(#grad3)',
        d: 'M 10,60 V 4 h 18 c 12,0 20,6 20,16 c 0,10 -8,16 -20,16 H 10 M 28,36 L 48,60',
        className: 'dash'
    }
];

const Loader1 = () => {
    return (
        <StyledWrapper>
            <div className="loader">
                {/* Gradient Definitions */}
                <svg height={0} width={0} viewBox="0 0 64 64" className="absolute">
                    <defs xmlns="http://www.w3.org/2000/svg">
                        <linearGradient gradientUnits="userSpaceOnUse" y2={2} x2={0} y1={62} x1={0} id="grad1">
                            <stop stopColor="#8b5cf6" />
                            <stop stopColor="#06b6d4" offset={1} />
                        </linearGradient>
                        <linearGradient gradientUnits="userSpaceOnUse" y2={0} x2={0} y1={64} x1={0} id="grad2">
                            <stop stopColor="#f59e0b" />
                            <stop stopColor="#ec4899" offset={1} />
                            <animateTransform
                                repeatCount="indefinite"
                                keySplines=".42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1"
                                keyTimes="0; 0.125; 0.25; 0.375; 0.5; 0.625; 0.75; 0.875; 1"
                                dur="8s"
                                values="0 32 32;-270 32 32;-270 32 32;-540 32 32;-540 32 32;-810 32 32;-810 32 32;-1080 32 32;-1080 32 32"
                                type="rotate"
                                attributeName="gradientTransform"
                            />
                        </linearGradient>
                        <linearGradient gradientUnits="userSpaceOnUse" y2={2} x2={0} y1={62} x1={0} id="grad3">
                            <stop stopColor="#10b981" />
                            <stop stopColor="#00f0ff" offset={1} />
                        </linearGradient>
                    </defs>
                </svg>

                {LETTERS.map(({ key, grad, d, className }) => (
                    <svg
                        key={key}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 64 64"
                        height={64}
                        width={64}
                        className="inline-block"
                    >
                        <path
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            strokeWidth={10}
                            stroke={grad}
                            d={d}
                            className={className}
                            pathLength={360}
                        />
                    </svg>
                ))}
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  .absolute {
    position: absolute;
  }

  .inline-block {
    display: inline-block;
  }

  .loader {
    display: flex;
    margin: 0.25em 0;
    gap: 0.5em;
  }

  .dash {
    animation: dashArray 2s ease-in-out infinite,
      dashOffset 2s linear infinite;
  }

  .spin {
    animation: spinDashArray 2s ease-in-out infinite,
      spin 8s ease-in-out infinite,
      dashOffset 2s linear infinite;
    transform-origin: center;
  }

  @keyframes dashArray {
    0% {
      stroke-dasharray: 0 1 359 0;
    }
    50% {
      stroke-dasharray: 0 359 1 0;
    }
    100% {
      stroke-dasharray: 359 1 0 0;
    }
  }

  @keyframes spinDashArray {
    0% {
      stroke-dasharray: 270 90;
    }
    50% {
      stroke-dasharray: 0 360;
    }
    100% {
      stroke-dasharray: 270 90;
    }
  }

  @keyframes dashOffset {
    0% {
      stroke-dashoffset: 365;
    }
    100% {
      stroke-dashoffset: 5;
    }
  }

  @keyframes spin {
    0% {
      rotate: 0deg;
    }
    12.5%, 25% {
      rotate: 270deg;
    }
    37.5%, 50% {
      rotate: 540deg;
    }
    62.5%, 75% {
      rotate: 810deg;
    }
    87.5%, 100% {
      rotate: 1080deg;
    }
  }
`;

export default Loader1;