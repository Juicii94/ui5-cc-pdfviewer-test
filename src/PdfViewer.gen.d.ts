import { CSSSize } from "sap/ui/core/library";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $ControlSettings } from "sap/ui/core/Control";

declare module "./PdfViewer" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $PdfViewerSettings extends $ControlSettings {
        pdfSource?: string | PropertyBindingInfo;
        height?: CSSSize | PropertyBindingInfo | `{${string}}`;
        zoomEnabled?: boolean | PropertyBindingInfo | `{${string}}`;
        navButtonsEnabled?: boolean | PropertyBindingInfo | `{${string}}`;
        displayToolbar?: boolean | PropertyBindingInfo | `{${string}}`;
        currentPage?: number | PropertyBindingInfo | `{${string}}`;
        totalPages?: number | PropertyBindingInfo | `{${string}}`;
        startPage?: number | PropertyBindingInfo | `{${string}}`;
        endPage?: number | PropertyBindingInfo | `{${string}}`;
        navToPage?: number | PropertyBindingInfo | `{${string}}`;
        displayPageNumbers?: boolean | PropertyBindingInfo | `{${string}}`;
        zoomScale?: number | PropertyBindingInfo | `{${string}}`;
    }

    export default interface PdfViewer {

        // property: pdfSource
        getPdfSource(): string;
        setPdfSource(pdfSource: string): this;

        // property: height
        getHeight(): CSSSize;
        setHeight(height: CSSSize): this;

        // property: zoomEnabled
        getZoomEnabled(): boolean;
        setZoomEnabled(zoomEnabled: boolean): this;

        // property: navButtonsEnabled
        getNavButtonsEnabled(): boolean;
        setNavButtonsEnabled(navButtonsEnabled: boolean): this;

        // property: displayToolbar
        getDisplayToolbar(): boolean;
        setDisplayToolbar(displayToolbar: boolean): this;

        // property: currentPage
        getCurrentPage(): number;
        setCurrentPage(currentPage: number): this;

        // property: totalPages
        getTotalPages(): number;
        setTotalPages(totalPages: number): this;

        // property: startPage
        getStartPage(): number;
        setStartPage(startPage: number): this;

        // property: endPage
        getEndPage(): number;
        setEndPage(endPage: number): this;

        // property: navToPage
        getNavToPage(): number;
        setNavToPage(navToPage: number): this;

        // property: displayPageNumbers
        getDisplayPageNumbers(): boolean;
        setDisplayPageNumbers(displayPageNumbers: boolean): this;

        // property: zoomScale
        getZoomScale(): number;
        setZoomScale(zoomScale: number): this;
    }
}
