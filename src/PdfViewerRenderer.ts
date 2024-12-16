import Lib from "sap/ui/core/Lib";
import RenderManager from "sap/ui/core/RenderManager";
import ToolbarSpacer from "sap/m/ToolbarSpacer";
import PdfViewer from "./PdfViewer";

/**
 * Pdf Viewer Renderer
 * @namespace
 */
export default {
	apiVersion: 2,
	/**
	 * Renders the HTML for the given control, using the provided {@link RenderManager}.
	 *
	 * @param rm The reference to the <code>sap.ui.core.RenderManager</code>
	 * @param control The control instance to be rendered
	 */
	render: function (rm: RenderManager, control: PdfViewer) {
		const i18n = Lib.getResourceBundleFor("com.gavdilabs");

		const toolbar = control.getToolbar(
			[
				new ToolbarSpacer(),
				control.getZoominButton(),
				control.getZoomoutButton(),
				control.getText(control.getPageStatus()),
				control.getPrevPageButton(),
				control.getNextPageButton(),
				new ToolbarSpacer(),
			],
			control.getDisplayToolbar(),
		);

		rm.openStart("div", control);
		rm.openEnd();
		rm.renderControl(toolbar);
		rm.openStart("div", `${control.getId()}-scrollCont`);
		rm.class("sapMScrollCont");
		rm.class("sapMScollContVH");
		rm.style("height", control.getHeight());
		rm.style("overflow", "auto");
		rm.style("display", "flex");
		rm.style("align-items", "start");
		rm.style("justify-content", "center");
		rm.openEnd();
		rm.openStart("canvas", `${control.getId()}-canvas`);
		rm.style("padding-top", "10px");
		rm.openEnd();
		rm.close("canvas");
		rm.close("div");
		rm.close("div");
	},
};
