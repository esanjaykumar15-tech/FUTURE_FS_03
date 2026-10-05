// Original brand-palette illustrations (no third-party artwork, no licensing issues).
// They stand in for photography until the café supplies real photos.
const C = {
  cream: '#F5EBDD', deep: '#EBDCC6', espresso: '#35251D', caramel: '#B8784A',
  dark: '#8A5530', white: '#FFFFFF', milk: '#FFF6E8', crust: '#5B3B2B', berry: '#8C3B4A', leaf: '#6B7A52',
};

function Frame({ label, bg = C.deep, vb = '0 0 400 300', children }) {
  return (
    <svg viewBox={vb} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label} className="block h-full w-full">
      <rect width="100%" height="100%" fill={bg} />
      {children}
    </svg>
  );
}
const Table = ({ y = 232 }) => <rect x="0" y={y} width="400" height={300 - y} fill={C.caramel} fillOpacity=".28" />;
const Steam = ({ x = 200, y = 100 }) => (
  <g fill="none" stroke={C.caramel} strokeWidth="5" strokeLinecap="round">
    <path d={`M${x - 28} ${y} c-10 -14 10 -22 0 -38`} />
    <path d={`M${x} ${y + 6} c-10 -14 10 -22 0 -38`} />
    <path d={`M${x + 28} ${y} c-10 -14 10 -22 0 -38`} />
  </g>
);

export const Latte = () => (
  <Frame label="Illustration of a latte in a white cup">
    <Table />
    <ellipse cx="200" cy="236" rx="115" ry="17" fill={C.white} />
    <ellipse cx="200" cy="232" rx="82" ry="10" fill={C.deep} />
    <path d="M275 150 h12 a22 22 0 0 1 0 44 h-16" fill="none" stroke={C.espresso} strokeWidth="6" strokeLinecap="round" />
    <path d="M125 135 H275 V175 C275 215 245 235 200 235 C155 235 125 215 125 175 Z" fill={C.white} stroke={C.espresso} strokeWidth="4" />
    <ellipse cx="200" cy="135" rx="75" ry="14" fill={C.dark} stroke={C.espresso} strokeWidth="4" />
    <path d="M200 141 C172 132 182 120 200 129 C218 120 228 132 200 141 Z" fill={C.cream} />
    <Steam y={104} />
  </Frame>
);

export const TopLatte = () => (
  <Frame label="Illustration of a latte seen from above">
    <circle cx="200" cy="150" r="118" fill={C.white} />
    <circle cx="200" cy="150" r="92" fill={C.deep} />
    <circle cx="200" cy="150" r="70" fill={C.white} stroke={C.espresso} strokeWidth="4" />
    <circle cx="200" cy="150" r="58" fill={C.dark} />
    <path d="M200 192 C150 165 164 128 200 146 C236 128 250 165 200 192 Z" fill={C.cream} />
    <path d="M200 176 C176 160 184 142 200 152 C216 142 224 160 200 176 Z" fill={C.dark} fillOpacity=".55" />
    <path d="M270 150 h24 a18 18 0 0 1 0 36 h-24" fill="none" stroke={C.espresso} strokeWidth="5" strokeLinecap="round" transform="rotate(-20 270 150)" />
  </Frame>
);

export const Iced = () => (
  <Frame label="Illustration of an iced drink with a straw">
    <Table y="226" />
    {/* scaled into the central safe area so wide, short cards don't crop the straw */}
    <g transform="translate(200 150) scale(.74) translate(-200 -150)">
      <path d="M212 170 L240 38" stroke={C.espresso} strokeWidth="9" strokeLinecap="round" />
      <path d="M156 112 H244 L236 243 Q235 250 227 250 H173 Q165 250 164 243 Z" fill={C.caramel} />
      <g fill={C.white} fillOpacity=".55" stroke={C.white}>
        <rect x="170" y="118" width="30" height="30" rx="6" transform="rotate(-12 185 133)" />
        <rect x="204" y="124" width="28" height="28" rx="6" transform="rotate(14 218 138)" />
        <rect x="182" y="176" width="30" height="30" rx="6" transform="rotate(8 197 191)" />
      </g>
      <path d="M150 70 H250 L238 245 Q237 255 227 255 H173 Q163 255 162 245 Z" fill={C.white} fillOpacity=".35" stroke={C.espresso} strokeWidth="4" />
    </g>
  </Frame>
);

export const Tea = () => (
  <Frame label="Illustration of a teapot and cup">
    <Table y="238" />
    <path d="M110 160 Q62 165 76 205 Q86 226 114 220" fill="none" stroke={C.dark} strokeWidth="12" strokeLinecap="round" />
    <path d="M238 178 Q292 168 286 118 Q272 152 236 150 Z" fill={C.dark} />
    <ellipse cx="175" cy="188" rx="74" ry="54" fill={C.dark} />
    <path d="M133 146 Q175 100 217 146 Z" fill={C.caramel} />
    <circle cx="175" cy="112" r="9" fill={C.espresso} />
    <path d="M122 200 Q175 225 228 200" fill="none" stroke={C.cream} strokeWidth="4" strokeLinecap="round" strokeOpacity=".7" />
    <path d="M296 210 h66 v8 a33 28 0 0 1 -66 0 z" fill={C.white} stroke={C.espresso} strokeWidth="4" />
    <ellipse cx="329" cy="210" rx="33" ry="7" fill={C.caramel} stroke={C.espresso} strokeWidth="4" />
  </Frame>
);

export const Croissant = () => {
  const seg = { fill: C.caramel, stroke: C.espresso, strokeWidth: 4 };
  return (
    <Frame label="Illustration of a croissant on a plate">
      <Table y="236" />
      <ellipse cx="200" cy="226" rx="130" ry="20" fill={C.white} />
      <g transform="translate(200 168)">
        <ellipse cx="-98" cy="30" rx="26" ry="19" transform="rotate(-55 -98 30)" {...seg} />
        <ellipse cx="98" cy="30" rx="26" ry="19" transform="rotate(55 98 30)" {...seg} />
        <ellipse cx="-62" cy="-2" rx="34" ry="27" transform="rotate(-32 -62 -2)" {...seg} />
        <ellipse cx="62" cy="-2" rx="34" ry="27" transform="rotate(32 62 -2)" {...seg} />
        <ellipse cx="0" cy="-16" rx="44" ry="35" {...seg} />
        <path d="M-20 -40 Q0 -28 -14 -2 M16 -42 Q34 -26 20 -2" fill="none" stroke={C.dark} strokeWidth="4" strokeLinecap="round" />
      </g>
    </Frame>
  );
};

export const Cake = () => (
  <Frame label="Illustration of a slice of layered cake">
    <Table y="238" />
    <ellipse cx="200" cy="228" rx="135" ry="18" fill={C.white} />
    <path d="M105 150 Q105 142 114 142 H286 Q295 142 295 150 V222 H105 Z" fill={C.milk} stroke={C.espresso} strokeWidth="4" />
    <path d="M105 192 H295 V222 H105 Z" fill={C.crust} stroke={C.espresso} strokeWidth="4" />
    <path d="M105 150 Q105 142 114 142 H286 Q295 142 295 150 V164 Q250 176 200 164 Q150 176 105 164 Z" fill={C.berry} />
  </Frame>
);

const Plant = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-22 0 H22 L16 38 H-16 Z" fill={C.dark} />
    <path d="M0 0 C-30 -20 -34 -50 -20 -70 C-4 -52 0 -26 0 0 Z" fill={C.leaf} />
    <path d="M0 0 C30 -24 36 -54 22 -78 C6 -56 0 -28 0 0 Z" fill={C.leaf} fillOpacity=".85" />
    <path d="M0 0 C-4 -30 4 -56 0 -90 C16 -60 12 -26 0 0 Z" fill={C.leaf} fillOpacity=".7" />
  </g>
);

export const Interior = () => (
  <Frame label="Illustration of a café interior with a hanging lamp and shelves">
    <rect x="0" y="236" width="400" height="64" fill={C.caramel} fillOpacity=".28" />
    <line x1="120" y1="0" x2="120" y2="60" stroke={C.espresso} strokeWidth="3" />
    <circle cx="120" cy="82" r="46" fill={C.caramel} fillOpacity=".22" />
    <path d="M92 84 Q120 36 148 84 Z" fill={C.espresso} />
    <rect x="215" y="70" width="150" height="8" rx="3" fill={C.espresso} />
    <rect x="215" y="140" width="150" height="8" rx="3" fill={C.espresso} />
    {[228, 262, 296, 330].map((x) => <path key={x} d={`M${x} 70 v-20 h22 v20 z`} fill={C.white} stroke={C.espresso} strokeWidth="3" />)}
    {[236, 280, 324].map((x) => <path key={x} d={`M${x} 140 v-26 h26 v26 z`} fill={C.milk} stroke={C.espresso} strokeWidth="3" />)}
    <Plant x="60" y="228" />
    <rect x="70" y="214" width="170" height="14" rx="5" fill={C.espresso} transform="translate(60 0)" />
    <rect x="150" y="228" width="8" height="40" fill={C.espresso} /><rect x="262" y="228" width="8" height="40" fill={C.espresso} />
    <path d="M178 214 v-22 h38 v22 z" fill={C.white} stroke={C.espresso} strokeWidth="3" />
  </Frame>
);

export const Hero = () => (
  <Frame label="Illustration of a café table with a coffee cup under a hanging lamp" vb="0 0 360 440">
    <line x1="180" y1="0" x2="180" y2="96" stroke={C.espresso} strokeWidth="4" />
    <circle cx="180" cy="150" r="86" fill={C.caramel} fillOpacity=".2" />
    <path d="M138 148 Q180 84 222 148 Z" fill={C.espresso} />
    <rect x="0" y="336" width="360" height="104" fill={C.caramel} fillOpacity=".28" />
    <Plant x="70" y="330" />
    <rect x="40" y="318" width="280" height="16" rx="6" fill={C.espresso} />
    <rect x="70" y="334" width="10" height="90" fill={C.espresso} /><rect x="280" y="334" width="10" height="90" fill={C.espresso} />
    <ellipse cx="180" cy="316" rx="62" ry="9" fill={C.white} />
    <path d="M222 268 h10 a16 16 0 0 1 0 32 h-12" fill="none" stroke={C.espresso} strokeWidth="5" strokeLinecap="round" />
    <path d="M140 256 H224 V284 C224 304 206 314 182 314 C158 314 140 304 140 284 Z" fill={C.white} stroke={C.espresso} strokeWidth="4" />
    <ellipse cx="182" cy="256" rx="42" ry="8" fill={C.dark} stroke={C.espresso} strokeWidth="4" />
    <Steam x={182} y={236} />
  </Frame>
);

// Menu category -> illustration
export const categoryArt = {
  'Hot Coffee': Latte, 'Cold Drinks': Iced, Tea, Snacks: Croissant, Desserts: Cake,
};
// Gallery rotation (varied scenes)
export const galleryArt = [TopLatte, Interior, Croissant, Cake, Iced, Tea];
