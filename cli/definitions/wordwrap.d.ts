declare module "wordwrap" {
	function wordwrap(width: number): (text: string) => string;
	export = wordwrap;
}