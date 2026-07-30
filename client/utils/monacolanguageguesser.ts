import type { Shareable } from '~/share';
import { languages } from 'monaco-editor';

const defaultLangId = 'plaintext';
const monacoLanguages = languages.getLanguages();

// the content-detection model doesn't speak monaco's language ids - it uses guesslang's
const contentLangToExtension: Record<string, string> = {
	asm: '.asm', bat: '.bat', c: '.c', cs: '.cs', cpp: '.cpp', clj: '.clj', cmake: '.cmake',
	cbl: '.cbl', coffee: '.coffee', css: '.css', csv: '.csv', dart: '.dart', dockerfile: 'Dockerfile',
	ex: '.ex', erl: '.erl', f90: '.f90', go: '.go', groovy: '.groovy', hs: '.hs', html: '.html',
	ini: '.ini', ipynb: '.json', java: '.java', js: '.js', json: '.json', jl: '.jl', kt: '.kt',
	lisp: '.lisp', lua: '.lua', makefile: 'Makefile', md: '.md', matlab: '.m', mm: '.m', ml: '.ml',
	pas: '.pas', pl: '.pl', pm: '.pl', php: '.php', ps1: '.ps1', prolog: '.pl', py: '.py', r: '.r',
	rb: '.rb', rs: '.rs', scala: '.scala', sh: '.sh', sql: '.sql', swift: '.swift', tex: '.tex',
	toml: '.toml', ts: '.ts', v: '.v', vba: '.vba', xml: '.xml', yaml: '.yaml',
};

const minContentConfidence = 0.04;
const minContentConfidenceLead = 1.5;

let modelOperations: import('@vscode/vscode-languagedetection').ModelOperations | undefined;

export class MonacoLanguageGuesser {
	constructor(protected share: Shareable, protected content?: string) { }

	protected guessByFileExtension(): string|null
	{
		const fileExt = ('.' + this.share.fileExtension).toLowerCase();

		for (const lang of monacoLanguages)
			if (lang.id != defaultLangId && lang.extensions?.includes(fileExt))
				return lang.id;

		return null;
	}

	protected guessByContentType(): string|null
	{
		const contentType = this.share.contentType!.toLowerCase();

		for (const lang of monacoLanguages)
			if (lang.id != defaultLangId && lang.mimetypes?.includes(contentType))
				return lang.id;

		return null;
	}

	protected async guessByContent(): Promise<string|null>
	{
		if (!this.content)
			return null;

		const [{ ModelOperations }, { default: modelJsonUrl }, { default: weightsUrl }] = await Promise.all([
			import('@vscode/vscode-languagedetection'),
			import('@vscode/vscode-languagedetection/model/model.json?url'),
			import('@vscode/vscode-languagedetection/model/group1-shard1of1.bin?url'),
		]);

		modelOperations ??= new ModelOperations({
			modelJsonLoaderFunc: () => fetch(modelJsonUrl).then(r => r.json()),
			weightsLoaderFunc: () => fetch(weightsUrl).then(r => r.arrayBuffer()),
		});

		const [top, runnerUp] = await modelOperations.runModel(this.content);

		if (!top || top.confidence < minContentConfidence)
			return null;

		if (runnerUp && top.confidence < runnerUp.confidence * minContentConfidenceLead)
			return null;

		const ext = contentLangToExtension[top.languageId];
		const lang = ext ? monacoLanguages.find(lang => lang.id != defaultLangId && lang.extensions?.includes(ext)) : undefined;

		return lang?.id ?? null;
	}

	public async guess(): Promise<string>
	{
		const guess = this.guessByFileExtension() ?? this.guessByContentType();
		if (guess)
			return guess;

		return (await this.guessByContent()) ?? defaultLangId;
	}
}
