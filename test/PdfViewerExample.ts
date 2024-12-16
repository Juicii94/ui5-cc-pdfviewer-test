import PdfViewer from "com/gavdilabs/ui5/cc/pdfviewer/PdfViewer";

new PdfViewer({
	id: "pdfviewerId",
	pdfSource: "https://api.printnode.com/static/test/pdf/multipage.pdf",
	displayToolbar: true,
	zoomEnabled: true,
	navToPage: 3,
	navButtonsEnabled: true,
	startPage: 1,
	currentPage: 1,
	endPage: 10,
}).placeAt("content");
