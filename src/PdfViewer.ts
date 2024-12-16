import Control from "sap/ui/core/Control";
import { MetadataOptions } from "sap/ui/core/Element";
import { getDocument, GlobalWorkerOptions, PDFWorker } from "pdfjs-dist";
import Button from "sap/m/Button";
import Lib from "sap/ui/core/Lib";
import Text from "sap/m/Text";
import JSONModel from "sap/ui/model/json/JSONModel";
import Toolbar from "sap/m/Toolbar";
import PdfViewerRenderer from "./PdfViewerRenderer";

/**
 * @extends Control
 * @author Emil Sejersbøll Valberg-Madsen
 * @version ${version}
 *
 * @constructor
 * @public
 * @name com.gavdilabs.ui5.cc.pdfviewer.PdfViewer
 */
export default class PdfViewer extends Control {
	constructor(id?: string | $PdfViewerSettings);
	constructor(id?: string, settings?: $PdfViewerSettings);
	constructor(id?: string, settings?: $PdfViewerSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		library: "com.gavdilabs",
		properties: {
			pdfSource: {
				type: "string",
				defaultValue: null,
			},
			height: {
				type: "sap.ui.core.CSSSize",
				defaultValue: "100%",
			},
			zoomEnabled: {
				type: "boolean",
				defaultValue: true,
			},
			navButtonsEnabled: {
				type: "boolean",
				defaultValue: true,
			},
			displayToolbar: {
				type: "boolean",
				defaultValue: true,
			},
			currentPage: {
				type: "float",
				defaultValue: 1,
			},
			totalPages: {
				type: "float",
				defaultValue: null,
			},
			startPage: {
				type: "float",
				defaultValue: 1,
			},
			endPage: {
				type: "float",
				defaultValue: null,
			},
			navToPage: {
				type: "float",
				defaultValue: null,
			},
			displayPageNumbers: {
				type: "boolean",
				defaultValue: true,
			},
			zoomScale: {
				type: "float",
				defaultValue: 1,
			},
		},
		events: {},
	};

	static renderer: typeof PdfViewerRenderer = PdfViewerRenderer;

	/* PRIVATE PROPERTIES */
	private _worker: PDFWorker;
	private _pdf: any;

	private _zoominButton: Button;
	private _zoomoutButton: Button;
	private _nextButton: Button;
	private _prevButton: Button;
	private _pageNumber: number;
	private _isRendering: boolean;

	private scale: number = 1;
	private _containerWidth: number;

	/* LIFE-CYCLE EVENTS */

	public init(): void {
		this.setModel(
			new JSONModel({ currentPage: 0, pages: 0, zoomScale: 1 }),
			"pdf",
		);
	}

	public onAfterRendering(): void {
		const container = window.document.getElementById(
			this.getId() + "-scrollCont",
		);

		this._containerWidth = container.offsetWidth;
		if (!this._isRendering) {
			this._updatePDF();
		}
	}

	/* PUBLIC EVENTS */

	public getZoominButton(): Button {
		const i18n = Lib.getResourceBundleFor("com.gavdilabs");
		const visible = this.getZoomEnabled();
		this._zoominButton = new Button({
			text: "",
			icon: "sap-icon://zoom-in",
			press: () => this._zoomin(),
			visible: visible,
		});
		return this._zoominButton;
	}

	public getZoomoutButton(): Button {
		const i18n = Lib.getResourceBundleFor("com.gavdilabs");
		const visible = this.getZoomEnabled();
		this._zoomoutButton = new Button({
			text: "",
			icon: "sap-icon://zoom-out",
			press: () => this._zoomout(),
			visible: visible,
		});
		return this._zoomoutButton;
	}

	public getNextPageButton(): Button {
		const i18n = Lib.getResourceBundleFor("com.gavdilabs");
		const visible = this.getNavButtonsEnabled();
		this._nextButton = new Button({
			text: "",
			icon: "sap-icon://sys-next-page",
			press: () => this._nextPage(),
			visible: visible,
		});
		return this._nextButton;
	}

	public getPrevPageButton(): Button {
		const i18n = Lib.getResourceBundleFor("com.gavdilabs");
		const visible = this.getNavButtonsEnabled();
		this._prevButton = new Button({
			text: "",
			icon: "sap-icon://sys-prev-page",
			press: () => this._prevPage(),
			visible: visible,
		});
		return this._prevButton;
	}

	public getText(text: string): Text {
		const i18n = Lib.getResourceBundleFor("com.gavdilabs");
		return new Text({
			text: text,
			visible: this.getDisplayPageNumbers(),
		});
	}

	public getPageStatus(): string {
		return `{pdf>currentPage} / {pdf>pages}`;
	}

	public getToolbar(content: Control[], visible?: boolean) {
		const toolbar = new Toolbar({ content: content, visible: visible });
		// toolbar.setModel(
		// 	new JSONModel({ currentPage: 0, pages: 0, zoomScale: 1 }),
		// 	"pdf",
		// );
		return toolbar;
	}

	public onNextPage() {
		this._nextPage();
	}

	public onPrevPage() {
		this._prevPage();
	}

	/* PRIVATE EVENTS */

	/* INTERNAL LOGIC */

	private _zoomin(): void {
		if (
			window.document.getElementById(this.getId() + "-canvas").offsetWidth >=
			this._containerWidth
		)
			return;

		this.scale = this.scale + 0.25;
		this.setZoomScale(this.scale);
		this._displayPDF(this._pageNumber);
	}

	private _zoomout(): void {
		this.scale = this.scale - 0.25 >= 1 ? this.scale - 0.25 : 1;
		this.setZoomScale(this.scale);
		this._displayPDF(this._pageNumber);
	}

	private async _nextPage(): Promise<void> {
		const endPage = this.getEndPage() ? this.getEndPage() : this._pdf.numPages;
		if (this._pageNumber >= endPage) {
			return;
		}

		this._pageNumber++;
		this.setCurrentPage(this._pageNumber);
		await this._displayPDF(this._pageNumber);
	}

	private async _prevPage(): Promise<void> {
		const startPage = this.getStartPage() ? this.getStartPage() : 1;
		if (this._pageNumber <= startPage) {
			return;
		}

		this._pageNumber--;
		this.setCurrentPage(this._pageNumber);
		await this._displayPDF(this._pageNumber);
	}

	private async _updatePDF(): Promise<void> {
		this._isRendering = true;
		if (this.getPdfSource()) {
			GlobalWorkerOptions.workerSrc =
				sap.ui.require.toUrl("pdfjs-dist") + "/build/pdf.worker.mjs";
			if (!this._worker) {
				this._worker = new PDFWorker();
			}

			let loadingTask: any;
			let isUrl = /^(ftp|http|https):\/\/[^ "]+$/.test(
				this.getPdfSource().trim(),
			);

			if (isUrl) {
				loadingTask = getDocument({
					url: this.getPdfSource().trim(),
					worker: this._worker,
				});
			} else {
				let pdfData = atob(this.getPdfSource().split(".")[1]);
				loadingTask = getDocument({
					data: pdfData,
					worker: this._worker,
				});
			}

			loadingTask.promise.then(
				(pdf: any) => {
					this._pdf = pdf;
					this._pageNumber =
						this.getNavToPage() !== 0
							? this.getNavToPage()
							: this.getCurrentPage()
								? this.getCurrentPage()
								: this._pdf.numPages;
					this.scale = this.getZoomScale() || 1;
					this.setCurrentPage(this._pageNumber);
					(this.getModel("pdf") as JSONModel).setProperty(
						"/pages",
						this.getEndPage() ? this.getEndPage() : this._pdf.numPages,
					);
					this.setNavToPage(0);
					this._displayPDF(this._pageNumber);
				},
				(error: unknown) => {
					console.log(error);
				},
			);
		}
	}

	private async _displayPDF(pageNumber: number): Promise<void> {
		if (this._pdf) {
			const page = await this._pdf.getPage(pageNumber);
			await this._renderPDF(page);
		}
	}

	private async _renderPDF(page: any) {
		const viewport = page.getViewport({ scale: this.scale });

		const canvas = window.document.getElementById(
			this.getId() + "-canvas",
		) as HTMLCanvasElement;

		if (!canvas) {
			this._isRendering = false;
			return;
		}

		const context = canvas.getContext("2d");
		canvas.height = viewport.height;
		canvas.width = viewport.width;

		const renderContext = {
			canvasContext: context,
			viewport: viewport,
		};

		const renderTask = page.render(renderContext);
		await renderTask.promise;
		this._isRendering = false;
	}
}
