import { ExampleColor } from "com/gavdilabs/ui5/cc/pdfviewer/library";
import Example from "com/gavdilabs/ui5/cc/pdfviewer/Example";

// create a new instance of the Example control and
// place it into the DOM element with the id "content"
new Example({
	text: "Example",
	color: ExampleColor.Highlight,
	press: (event) => {
		alert(event.getSource());
	}
}).placeAt("content");
