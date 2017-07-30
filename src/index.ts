import {Str} from 'ta-helpers';
const rgbaRegex = /^(rgba?)\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*(1|0|0.\d+))?\)$/i;
const hslaRegex = /^(hsla?)\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%(?:,\s*(1|0|0.\d+))?\)$/i;
const hexRegex = /^#([\da-f]{1,2})([\da-f]{1,2})([\da-f]{1,2})([\da-f]{2})?$/i;

export class Color {
	private _red = 0;
	private _green = 0;
	private _blue = 0;
	private _alpha = 0;
	private _hue = 0;
	private _saturation = 0;
	private _lightness = 0;
	private _brightness = 0;
	private _brightnessSaturation = 0;

	// region getters & setters
	public get red(): number { return this._red; }
	public get green(): number { return this._green; }
	public get blue(): number { return this._blue; }
	public get alpha(): number { return this._alpha; }
	public get hue(): number { return this._hue; }
	public get saturation(): number { return this._saturation; }
	public get lightness(): number { return this._lightness; }
	public get brightness(): number { return this._brightness; }
	public get brightnessSaturation(): number { return this._brightnessSaturation; }
	public set alpha(alpha: number) { this._alpha = alpha; }

	/**
	 *
	 * @returns {string}
	 */
	public get hexCode(): string {
		let code = '#' + (this._red < 0x10 ? '0' : '') + this._red.toString(16).toUpperCase() +
			(this._green < 0x10 ? '0' : '') + this._green.toString(16).toUpperCase() +
			(this._blue < 0x10 ? '0' : '') + this._blue.toString(16).toUpperCase();

		if (this._alpha < 1) {
			const a = Math.floor(this._alpha * 255);
			code += (a < 10 ? '0' : '') + a.toString(16).toUpperCase();
		}

		return code;
	}

	/**
	 *
	 * @returns {string}
	 */
	public get rgb(): string {
		return 'rgb(' + this._red + ', ' + this._green + ', ' + this._blue + ')';
	}

	/**
	 *
	 * @returns {string}
	 */
	public get rgba(): string {
		return 'rgba(' + this._red + ', ' + this._green + ', ' + this._blue + ', ' + this._alpha + ')';
	}

	/**
	 *
	 * @returns {string}
	 */
	public get hsl(): string {
		return 'hsl(' + this._hue + '%, ' + this._saturation + '%, ' + this._lightness + '%)';
	}

	/**
	 *
	 * @returns {string}
	 */
	public get hsla(): string {
		return 'hsla(' + this._hue + '%, ' + this._saturation + '%, ' + this._lightness + '%, ' + this._alpha + ')';
	}

	/**
	 *
	 * @returns {number}
	 */
	public get luminance(): number {
		return 0.2126 * this._red + 0.7152 * this._green + 0.0722 * this._blue;
	}

	/**
	 *
	 * @returns {number}
	 */
	public get luma(): number {
		return this.gammaCorrection().luminance;
	}
	// endregion

	// region Builders
	/**
	 * Parses an RGBA string
	 * @param {string} color
	 * @returns {Color}
	 */
	public static fromRGBAString(color: string): Color {
		const capture = rgbaRegex.exec(color);
		return Color.fromRGBA(parseInt(capture[2], 10), parseInt(capture[3], 10), parseInt(capture[4], 10),
			capture[1] === 'rgba' ? parseFloat(capture[5]) : 1);
	}

	/**
	 * Parses an HSLA string
	 * @param {string} color
	 * @returns {Color}
	 */
	public static fromHSLAString(color: string): Color {
		const capture = hslaRegex.exec(color);
		return Color.fromRGBA(parseInt(capture[2], 10), parseInt(capture[3], 10) / 100, parseInt(capture[4], 10) / 100,
			capture[1] === 'rgba' ? parseFloat(capture[5]) : 1);
	}

	/**
	 * Creates a color from RGBA components
	 * @param {number} red
	 * @param {number} green
	 * @param {number} blue
	 * @param {number} alpha
	 * @returns {Color}
	 */
	public static fromRGBA(red: number, green: number, blue: number, alpha: number = 1): Color {
		const color = new Color();
		color._red = red;
		color._green = green;
		color._blue = blue;
		color._alpha = alpha;
		color.calculateHSL();
		color.calculateHSV();
		return color;
	}

	/**
	 * Creates a color from HSVA components
	 * @param {number} hue
	 * @param {number} saturation
	 * @param {number} brightness
	 * @param {number} alpha
	 * @returns {Color}
	 */
	public static fromHSVA(hue: number, saturation: number, brightness: number, alpha: number = 1): Color {
		const color = new Color();
		color._brightnessSaturation = saturation;
		color._brightness = brightness;
		color._hue = hue;
		color._alpha = alpha;

		saturation *= 0.01;
		brightness *= 0.01;
		const lightness = (2 - saturation) * brightness * 0.5;
		saturation = lightness > 0 && lightness < 1 ?
			saturation * brightness / (lightness < 0.5 ? lightness * 2 : 2 - lightness * 2)
			: saturation;
		color._lightness = lightness * 100;
		color._saturation = saturation * 100;
		color.calculateRGB();

		return color;
	}

	/**
	 * Creates a color from its hexcode
	 * @param {string} color
	 * @returns {Color}
	 */
	public static fromHexCode(color: string): Color {
		const capture = hexRegex.exec(color);
		return Color.fromRGBA(parseInt(capture[1], 16), parseInt(capture[2], 16), parseInt(capture[3], 16),
			capture[4] !== undefined ? parseInt(capture[4], 16) / 255 : 1);
	}

	/**
	 * Creates a color from HSLA components
	 * @param {number} hue
	 * @param {number} saturation
	 * @param {number} lightness
	 * @param {number} alpha
	 * @returns {Color}
	 */
	public static fromHSLA(hue: number, saturation: number, lightness: number, alpha: number = 1): Color {
		const color = new Color();
		color._hue = hue;
		color._saturation = saturation;
		color._lightness = lightness;
		color._alpha = alpha;
		color.calculateRGB();
		color.calculateHSV();
		return color;
	}

	/**
	 * Parses a string with unknown format
	 * @param {string} color
	 * @returns {Color}
	 */
	public static fromString(color: string): Color {
		const c = this[Str.capitalize(color)];
		if (c != null) return c;
		if (rgbaRegex.test(color)) return Color.fromRGBAString(color);
		if (hslaRegex.test(color)) return Color.fromHSLAString(color);
		if (hexRegex.test(color)) return Color.fromHexCode(color);
	}
	// endregion

	// region Static operations
	/**
	 * Mixes two colors
	 * @param {Color} c1
	 * @param {Color} c2
	 * @param {number} weight
	 * @returns {Color}
	 */
	public static mix(c1: Color, c2: Color, weight: number): Color {
		return c1.mix(c2, weight);
	}
	// endregion

	// region Channel Operations
	private static multiplyChannel(c1: number, c2: number): number {
		return Math.round(c1 * c2 / 255);
	}

	private static screenChannel(c1: number, c2: number): number {
		return Math.round(255 - (255 - c1) * (255 - c2) / 255);
	}
	// endregion

	// region Operations
	/**
	 * Calculate the inverse of the current color
	 * @returns {Color}
	 */
	public inverse(): Color {
		return Color.fromRGBA(255 - this._red, 255 - this._green, 255 - this._blue);
	}

	/**
	 * Desaturates the current color to get the grayscale
	 * @returns {Color}
	 */
	public grayscale(): Color {
		return this.desaturate(100);
	}

	/**
	 * Desaturates the color
	 * @param {number} percent
	 * @returns {Color}
	 */
	public desaturate(percent: number): Color {
		return Color.fromHSLA(this._hue, Math.max(0, this._saturation - percent), this._lightness, this._alpha);
	}

	/**
	 * Increase the color saturation
	 * @param {number} percent
	 * @returns {Color}
	 */
	public saturate(percent: number): Color {
		return Color.fromHSLA(this._hue, Math.min(100, this._saturation + percent), this._lightness, this._alpha);
	}

	/**
	 * Decreases the lightness
	 * @param {number} percent
	 * @returns {Color}
	 */
	public darken(percent: number): Color {
		return Color.fromHSLA(this._hue, this._saturation, Math.max(0, this._lightness - percent), this._alpha);
	}

	/**
	 * Increses the lightness
	 * @param {number} percent
	 * @returns {Color}
	 */
	public lighten(percent: number): Color {
		return Color.fromHSLA(this._hue, this._saturation, Math.min(1000, this._lightness + percent), this._alpha);
	}

	/**
	 * Changes the hue component
	 * @param {number} degree
	 * @returns {Color}
	 */
	public spin(degree: number): Color {
		return Color.fromHSLA((this._hue + degree + 360) % 360, this._saturation, this._lightness, this._alpha);
	}

	/**
	 *
	 * @param {number} weight
	 * @returns {Color}
	 */
	public tint(weight: number): Color {
		return Color.mix(Color.White, this, weight);
	}

	/**
	 *
	 * @param {number} weight
	 * @returns {Color}
	 */
	public shade(weight: number): Color {
		return Color.mix(Color.Black, this, weight);
	}

	/**
	 * Gets the color with the best contrast with the current color
	 * @param {Color} dark
	 * @param {Color} light
	 * @returns {Color}
	 */
	public contrast(dark: Color = Color.Black, light = Color.White): Color {
		const cl = this.luma;
		const dl = dark.luma;
		const ll = light.luma;
		return Math.abs(cl - dl) > Math.abs(cl - ll) ? dark : light;
	}

	/**
	 * Mixes the current color with another color
	 * @param {Color} other
	 * @param {number} weight
	 * @returns {Color}
	 */
	public mix(other: Color, weight: number): Color {
		const w = 1 - weight;
		return Color.fromRGBA(
			Math.round(this._red * weight + other._red * w),
			Math.round(this._green * weight + other._green * w),
			Math.round(this._blue * weight + other._blue * w),
			this._alpha * weight + other._alpha * w
		);
	}

	/**
	 *
	 * @param {Color} other
	 * @returns {Color}
	 */
	public multiply(other: Color): Color {
		return Color.fromRGBA(
			Color.multiplyChannel(this._red, other._red),
			Color.multiplyChannel(this._green, other._green),
			Color.multiplyChannel(this._blue, other._blue),
			this._alpha * other._alpha
		);
	}

	/**
	 *
	 * @param {Color} other
	 * @returns {Color}
	 */
	public screen(other: Color): Color {
		return Color.fromRGBA(
			Color.screenChannel(this._red, other._red),
			Color.screenChannel(this._green, other._green),
			Color.screenChannel(this._blue, other._blue),
			this._alpha
		);
	}

	/**
	 *
	 * @param {Color} other
	 * @returns {Color}
	 */
	public overlay(other: Color): Color {
		return Color.fromRGBA(
			(this._red >= 128 ? Color.screenChannel : Color.multiplyChannel)(this._red, other._red),
			(this._green >= 128 ? Color.screenChannel : Color.multiplyChannel)(this._green, other._green),
			(this._blue >= 128 ? Color.screenChannel : Color.multiplyChannel)(this._blue, other._blue),
			this._alpha
		);
	}

	/**
	 *
	 * @param {Color} other
	 * @returns {Color}
	 */
	public hardlight(other: Color): Color {
		return other.overlay(this);
	}

	/**
	 *
	 * @param {Color} other
	 * @returns {Color}
	 */
	public difference(other: Color): Color {
		return Color.fromRGBA(
			Math.abs(this._red - other._red),
			Math.abs(this._green - other._green),
			Math.abs(this._blue - other._blue),
			this._alpha
		);
	}

	/**
	 *
	 * @param {Color} other
	 * @returns {Color}
	 */
	public average(other: Color): Color {
		return this.mix(other, 0.5);
	}

	/**
	 *
	 * @param {Color} other
	 * @returns {Color}
	 */
	public negation(other: Color): Color {
		const r = this._red + other._red;
		const g = this._green + other._green;
		const b = this._blue + other._green;
		return Color.fromRGBA(
			r > 0xFF ? 0x1FE - r : r,
			g > 0xFF ? 0x1FE - g : g,
			b > 0xFF ? 0x1FE - b : b,
		);
	}

	/**
	 *
	 * @param {number} gamma
	 * @returns {Color}
	 */
	public gammaCorrection(gamma: number = 2.2): Color {
		gamma = 1 / gamma;
		return Color.fromRGBA(
			Math.floor(255 * Math.pow(this._red / 255, gamma)),
			Math.floor(255 * Math.pow(this._green / 255, gamma)),
			Math.floor(255 * Math.pow(this._blue / 255, gamma)),
			this._alpha
		);
	}
	// endregion

	// region Components calculations
	/**
	 * Calculate HSL components from RGB
	 */
	private calculateHSL(): void {
		const r = this._red / 255;
		const g = this._green / 255;
		const b = this._blue / 255;
		const max = Math.max(Math.max(r, g), b);
		const min = Math.min(Math.min(r, g), b);
		const chroma = max - min;

		if (chroma === 0) this._hue = 0;
		else if (max === r) this._hue = ((g - b) / chroma + 6) % 6;
		else if (max === g) this._hue = (b - r) / chroma + 2;
		else this._hue = (r - g) / chroma + 4;
		const l = 0.5 * (max + min);
		const s = chroma === 0 ? 0 : chroma / (1 - Math.abs(2 * l - 1));

		this._hue = Math.floor(this._hue * 60);
		this._saturation = Math.floor(100 * s);
		this._lightness = Math.floor(100 * l);
	}

	/**
	 * Calculate RGB components from HSL
	 */
	private calculateRGB(): void {
		const saturation = this._saturation * 0.01;
		const lightness = this._lightness * 0.01;
		const chroma = saturation * (1 - Math.abs(2 * lightness - 1));
		const h = this._hue / 60;
		const x = chroma * (1 - Math.abs((h % 2) - 1));
		let r, g, b;
		if (h < 1) [r, g, b] = [chroma, x, 0];
		else if (h < 2) [r, g, b] = [x, chroma, 0];
		else if (h < 3) [r, g, b] = [0, chroma, x];
		else if (h < 4) [r, g, b] = [0, x, chroma];
		else if (h < 5) [r, g, b] = [x, 0, chroma];
		else [r, g, b] = [chroma, 0, x];
		const m = Math.max(Math.min(lightness - 0.5 * chroma, 1), 0);
		this._red = Math.floor(255 * (r + m));
		this._green = Math.floor(255 * (g + m));
		this._blue = Math.floor(255 * (b + m));
	}

	/**
	 * Calculates HSV components from HSL
	 */
	private calculateHSV(): void {
		const l = this._lightness * 0.01;
		const s = this._saturation * 0.01;
		const b = l + 0.5 * s * (1 - Math.abs(2 * l - 1));
		const bs = b === 0 ? 0 : 2 * (b - l) / b;
		this._brightness = b * 100;
		this._brightnessSaturation = bs * 100;
	}
	// endregion

	// region Named colors
	public static get Transparent(): Color { return Color.fromRGBA(0, 0, 0, 0); }	
	public static get AntiqueWhite(): Color { return Color.fromHexCode('#FAEBD7'); }
	public static get Aqua(): Color { return Color.fromHexCode('#00FFFF'); }
	public static get Aquamarine(): Color { return Color.fromHexCode('#7FFFD4'); }
	public static get Azure(): Color { return Color.fromHexCode('#F0FFFF'); }
	public static get Beige(): Color { return Color.fromHexCode('#F5F5DC'); }
	public static get Bisque(): Color { return Color.fromHexCode('#FFE4C4'); }
	public static get Black(): Color { return Color.fromHexCode('#000000'); }
	public static get BlanchedAlmond(): Color { return Color.fromHexCode('#FFEBCD'); }
	public static get Blue(): Color { return Color.fromHexCode('#0000FF'); }
	public static get BlueViolet(): Color { return Color.fromHexCode('#8A2BE2'); }
	public static get Brown(): Color { return Color.fromHexCode('#A52A2A'); }
	public static get BurlyWood(): Color { return Color.fromHexCode('#DEB887'); }
	public static get CadetBlue(): Color { return Color.fromHexCode('#5F9EA0'); }
	public static get Chartreuse(): Color { return Color.fromHexCode('#7FFF00'); }
	public static get Chocolate(): Color { return Color.fromHexCode('#D2691E'); }
	public static get Coral(): Color { return Color.fromHexCode('#FF7F50'); }
	public static get CornflowerBlue(): Color { return Color.fromHexCode('#6495ED'); }
	public static get Cornsilk(): Color { return Color.fromHexCode('#FFF8DC'); }
	public static get Crimson(): Color { return Color.fromHexCode('#DC143C'); }
	public static get Cyan(): Color { return Color.fromHexCode('#00FFFF'); }
	public static get DarkBlue(): Color { return Color.fromHexCode('#00008B'); }
	public static get DarkCyan(): Color { return Color.fromHexCode('#008B8B'); }
	public static get DarkGoldenRod(): Color { return Color.fromHexCode('#B8860B'); }
	public static get DarkGray(): Color { return Color.fromHexCode('#A9A9A9'); }
	public static get DarkGreen(): Color { return Color.fromHexCode('#006400'); }
	public static get DarkKhaki(): Color { return Color.fromHexCode('#BDB76B'); }
	public static get DarkMagenta(): Color { return Color.fromHexCode('#8B008B'); }
	public static get DarkOliveGreen(): Color { return Color.fromHexCode('#556B2F'); }
	public static get DarkOrange(): Color { return Color.fromHexCode('#FF8C00'); }
	public static get DarkOrchid(): Color { return Color.fromHexCode('#9932CC'); }
	public static get DarkRed(): Color { return Color.fromHexCode('#8B0000'); }
	public static get DarkSalmon(): Color { return Color.fromHexCode('#E9967A'); }
	public static get DarkSeaGreen(): Color { return Color.fromHexCode('#8FBC8F'); }
	public static get DarkSlateBlue(): Color { return Color.fromHexCode('#483D8B'); }
	public static get DarkSlateGray(): Color { return Color.fromHexCode('#2F4F4F'); }
	public static get DarkTurquoise(): Color { return Color.fromHexCode('#00CED1'); }
	public static get DarkViolet(): Color { return Color.fromHexCode('#9400D3'); }
	public static get DeepPink(): Color { return Color.fromHexCode('#FF1493'); }
	public static get DeepSkyBlue(): Color { return Color.fromHexCode('#00BFFF'); }
	public static get DimGray(): Color { return Color.fromHexCode('#696969'); }
	public static get DodgerBlue(): Color { return Color.fromHexCode('#1E90FF'); }
	public static get FireBrick(): Color { return Color.fromHexCode('#B22222'); }
	public static get FloralWhite(): Color { return Color.fromHexCode('#FFFAF0'); }
	public static get ForestGreen(): Color { return Color.fromHexCode('#228B22'); }
	public static get Fuchsia(): Color { return Color.fromHexCode('#FF00FF'); }
	public static get Gainsboro(): Color { return Color.fromHexCode('#DCDCDC'); }
	public static get GhostWhite(): Color { return Color.fromHexCode('#F8F8FF'); }
	public static get Gold(): Color { return Color.fromHexCode('#FFD700'); }
	public static get GoldenRod(): Color { return Color.fromHexCode('#DAA520'); }
	public static get Gray(): Color { return Color.fromHexCode('#808080'); }
	public static get Green(): Color { return Color.fromHexCode('#008000'); }
	public static get GreenYellow(): Color { return Color.fromHexCode('#ADFF2F'); }
	public static get HoneyDew(): Color { return Color.fromHexCode('#F0FFF0'); }
	public static get HotPink(): Color { return Color.fromHexCode('#FF69B4'); }
	public static get IndianRed(): Color { return Color.fromHexCode('#CD5C5C'); }
	public static get Indigo(): Color { return Color.fromHexCode('#4B0082'); }
	public static get Ivory(): Color { return Color.fromHexCode('#FFFFF0'); }
	public static get Khaki(): Color { return Color.fromHexCode('#F0E68C'); }
	public static get Lavender(): Color { return Color.fromHexCode('#E6E6FA'); }
	public static get LavenderBlush(): Color { return Color.fromHexCode('#FFF0F5'); }
	public static get LawnGreen(): Color { return Color.fromHexCode('#7CFC00'); }
	public static get LemonChiffon(): Color { return Color.fromHexCode('#FFFACD'); }
	public static get LightBlue(): Color { return Color.fromHexCode('#ADD8E6'); }
	public static get LightCoral(): Color { return Color.fromHexCode('#F08080'); }
	public static get LightCyan(): Color { return Color.fromHexCode('#E0FFFF'); }
	public static get LightGoldenRodYellow(): Color { return Color.fromHexCode('#FAFAD2'); }
	public static get LightGray(): Color { return Color.fromHexCode('#D3D3D3'); }
	public static get LightGreen(): Color { return Color.fromHexCode('#90EE90'); }
	public static get LightPink(): Color { return Color.fromHexCode('#FFB6C1'); }
	public static get LightSalmon(): Color { return Color.fromHexCode('#FFA07A'); }
	public static get LightSeaGreen(): Color { return Color.fromHexCode('#20B2AA'); }
	public static get LightSkyBlue(): Color { return Color.fromHexCode('#87CEFA'); }
	public static get LightSlateGray(): Color { return Color.fromHexCode('#778899'); }
	public static get LightSteelBlue(): Color { return Color.fromHexCode('#B0C4DE'); }
	public static get LightYellow(): Color { return Color.fromHexCode('#FFFFE0'); }
	public static get Lime(): Color { return Color.fromHexCode('#00FF00'); }
	public static get LimeGreen(): Color { return Color.fromHexCode('#32CD32'); }
	public static get Linen(): Color { return Color.fromHexCode('#FAF0E6'); }
	public static get Magenta(): Color { return Color.fromHexCode('#FF00FF'); }
	public static get Maroon(): Color { return Color.fromHexCode('#800000'); }
	public static get MediumAquaMarine(): Color { return Color.fromHexCode('#66CDAA'); }
	public static get MediumBlue(): Color { return Color.fromHexCode('#0000CD'); }
	public static get MediumOrchid(): Color { return Color.fromHexCode('#BA55D3'); }
	public static get MediumPurple(): Color { return Color.fromHexCode('#9370DB'); }
	public static get MediumSeaGreen(): Color { return Color.fromHexCode('#3CB371'); }
	public static get MediumSlateBlue(): Color { return Color.fromHexCode('#7B68EE'); }
	public static get MediumSpringGreen(): Color { return Color.fromHexCode('#00FA9A'); }
	public static get MediumTurquoise(): Color { return Color.fromHexCode('#48D1CC'); }
	public static get MediumVioletRed(): Color { return Color.fromHexCode('#C71585'); }
	public static get MidnightBlue(): Color { return Color.fromHexCode('#191970'); }
	public static get MintCream(): Color { return Color.fromHexCode('#F5FFFA'); }
	public static get MistyRose(): Color { return Color.fromHexCode('#FFE4E1'); }
	public static get Moccasin(): Color { return Color.fromHexCode('#FFE4B5'); }
	public static get NavajoWhite(): Color { return Color.fromHexCode('#FFDEAD'); }
	public static get Navy(): Color { return Color.fromHexCode('#000080'); }
	public static get OldLace(): Color { return Color.fromHexCode('#FDF5E6'); }
	public static get Olive(): Color { return Color.fromHexCode('#808000'); }
	public static get OliveDrab(): Color { return Color.fromHexCode('#6B8E23'); }
	public static get Orange(): Color { return Color.fromHexCode('#FFA500'); }
	public static get OrangeRed(): Color { return Color.fromHexCode('#FF4500'); }
	public static get Orchid(): Color { return Color.fromHexCode('#DA70D6'); }
	public static get PaleGoldenRod(): Color { return Color.fromHexCode('#EEE8AA'); }
	public static get PaleGreen(): Color { return Color.fromHexCode('#98FB98'); }
	public static get PaleTurquoise(): Color { return Color.fromHexCode('#AFEEEE'); }
	public static get PaleVioletRed(): Color { return Color.fromHexCode('#DB7093'); }
	public static get PapayaWhip(): Color { return Color.fromHexCode('#FFEFD5'); }
	public static get PeachPuff(): Color { return Color.fromHexCode('#FFDAB9'); }
	public static get Peru(): Color { return Color.fromHexCode('#CD853F'); }
	public static get Pink(): Color { return Color.fromHexCode('#FFC0CB'); }
	public static get Plum(): Color { return Color.fromHexCode('#DDA0DD'); }
	public static get PowderBlue(): Color { return Color.fromHexCode('#B0E0E6'); }
	public static get Purple(): Color { return Color.fromHexCode('#800080'); }
	public static get RebeccaPurple(): Color { return Color.fromHexCode('#663399'); }
	public static get Red(): Color { return Color.fromHexCode('#FF0000'); }
	public static get RosyBrown(): Color { return Color.fromHexCode('#BC8F8F'); }
	public static get RoyalBlue(): Color { return Color.fromHexCode('#4169E1'); }
	public static get SaddleBrown(): Color { return Color.fromHexCode('#8B4513'); }
	public static get Salmon(): Color { return Color.fromHexCode('#FA8072'); }
	public static get SandyBrown(): Color { return Color.fromHexCode('#F4A460'); }
	public static get SeaGreen(): Color { return Color.fromHexCode('#2E8B57'); }
	public static get SeaShell(): Color { return Color.fromHexCode('#FFF5EE'); }
	public static get Sienna(): Color { return Color.fromHexCode('#A0522D'); }
	public static get Silver(): Color { return Color.fromHexCode('#C0C0C0'); }
	public static get SkyBlue(): Color { return Color.fromHexCode('#87CEEB'); }
	public static get SlateBlue(): Color { return Color.fromHexCode('#6A5ACD'); }
	public static get SlateGray(): Color { return Color.fromHexCode('#708090'); }
	public static get Snow(): Color { return Color.fromHexCode('#FFFAFA'); }
	public static get SpringGreen(): Color { return Color.fromHexCode('#00FF7F'); }
	public static get SteelBlue(): Color { return Color.fromHexCode('#4682B4'); }
	public static get Tan(): Color { return Color.fromHexCode('#D2B48C'); }
	public static get Teal(): Color { return Color.fromHexCode('#008080'); }
	public static get Thistle(): Color { return Color.fromHexCode('#D8BFD8'); }
	public static get Tomato(): Color { return Color.fromHexCode('#FF6347'); }
	public static get Turquoise(): Color { return Color.fromHexCode('#40E0D0'); }
	public static get Violet(): Color { return Color.fromHexCode('#EE82EE'); }
	public static get Wheat(): Color { return Color.fromHexCode('#F5DEB3'); }
	public static get White(): Color { return Color.fromHexCode('#FFFFFF'); }
	public static get WhiteSmoke(): Color { return Color.fromHexCode('#F5F5F5'); }
	public static get Yellow(): Color { return Color.fromHexCode('#FFFF00'); }
	public static get YellowGreen(): Color { return Color.fromHexCode('#9ACD32'); }
	// endregion
}