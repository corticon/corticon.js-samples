/* Example Usage
	import { COLORS } from './constants/constants';
	...
	const styles = StyleSheet.create({
		someView {
			backgroundColor: COLORS.background.light,
		}
	})
*/
const COLORS = {
	primary: '#64dd17',
	accent: '#b2ff59',
	secondary: '#0091ea',
	secondary_accent: '#40c4ff',
	background: {
		light: '#fff',
		dark: '#eee',
		dark_accent: "#bbb",
	},
	text: {
		light: '#fafafa',
		dark: '#212121',
		info: '#424242',
	},
	indicator: {
		orange: '#ffa726',
		yellow: '#ffee58',
		green: '#66bb6a',
		red: '#ef5350',
	},
	red: '#ef5350',
	green: '#66bb6a',
};

const SIZES = {
	text: {
		default: 14,
		s1: 18,
		s2: 24,
		s3: 32,
		s4: 48,
		s5: 64,
	}
};

export { COLORS, SIZES };