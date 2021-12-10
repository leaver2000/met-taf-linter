

import { useEffect, useState } from 'react';
import JSONtree from 'react-json-tree'
// import { pdfjsLib } from 'react-pdf'
import pdfjsLib from 'pdfjs-dist'
import pdfDoc from "./testdashone.pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export default function DashOne() {
    const [content, setContent] = useState(null)
    const [textString, setTextString] = useState(null)
    const [parsed, setParsed] = useState(null)

    useEffect(() => {
        // if (!!loadingTask) {
        const loadingTask = pdfjsLib.getDocument(pdfDoc)

        loadingTask.promise.then(function (pdf) {
            pdf.getPage(1).then(function (page) {
                // you can now use *page* here
                page.getTextContent({})
                    .then((content) => {
                        setContent(content)
                        setTextString(content.items.map(({ str }) => str.trim()).join(""))
                    })

            });

            // you can now use *pdf* here
        });



    }, [])
    useEffect(() => {
        if (!!textString) {
            setParsed(textString.split(/PART[IV]+/))



        }
    }, [textString])


    return <div>pdfjs:
        {/* <JSONtree hideRoot data={pdfjsLib} /> */}
        content:
        <JSONtree hideRoot data={content} />
        parsed:
        <JSONtree hideRoot data={parsed} />
        textString:
        <JSONtree hideRoot data={textString} />
    </div>
}