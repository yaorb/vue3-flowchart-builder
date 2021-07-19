<template>
    <div style="width: 100%;height: 100%;position: relative;">
        <jsplumb-toolkit ref="toolkitComponent" v-bind:render-params="renderParams" url="data/copyright.json" v-bind:view="view" id="toolkit" surface-id="surface" v-bind:toolkit-params="toolkitParams"></jsplumb-toolkit>
    </div>
</template>

<script>

    import * as Dialogs from "@jsplumbtoolkit/dialogs"
    import { getSurface, BrowserUIVue3 } from '@jsplumbtoolkit/browser-ui-vue3'
    import { uuid } from "@jsplumbtoolkit/core"
    import { SpringLayout } from "@jsplumbtoolkit/layout-spring"
    // import { ready } from "@jsplumbtoolkit/browser-ui"
    //
    import { LassoPlugin } from "@jsplumbtoolkit/browser-ui-plugin-lasso"
    import { DrawingToolsPlugin } from "@jsplumbtoolkit/browser-ui-plugin-drawing-tools"

    import { markRaw } from "vue"

    //
    // when not using Typescript, and not accessing something inside these modules, it is necessary to import them like this
    // in order for them to register themselves with the Toolkit
    //
    // import * as ConnectorEditors from "@jsplumbtoolkit/connector-editors"
    import * as OrthogonalConnector from "@jsplumbtoolkit/connector-orthogonal"
    // import * as OrthogonalConnectorEditors from "@jsplumbtoolkit/connector-editors-orthogonal"

    import StartNode from './StartNode.vue'
    import ActionNode from './ActionNode.vue'
    import QuestionNode from './QuestionNode.vue'
    import OutputNode from './OutputNode.vue'

    let toolkitComponent
    let toolkit
    let surface
    let dialogs
    let edgeEditor

function editEdge(params) {
    dialogs.show({
        id: "dlgText",
        data: {
            text: params.edge.data.label || ""
        },
        onOK: function (data) {
            toolkit.updateEdge(params.edge, {label:data.text});
        }
    });
}

function nodeFactory(type, data, callback)  {
    dialogs.show({
        id: "dlgText",
        title: "Enter " + type + " name:",
        onOK: function (d) {
            data.text = d.text;
            // if the user entered a name...
            if (data.text) {
                // and it was at least 2 chars
                if (data.text.length >= 2) {
                    // set an id and continue.
                    data.id = uuid();
                    callback(data);
                }
                else
                // else advise the user.
                    alert(type + " names must be at least 2 characters!");
            }
            // else...do not proceed.
        }
    });
}

    export default {

        name: 'jsp-toolkit',
        props:{surfaceId:String},
        data:() => {
            return markRaw({
                toolkitParams:{
                    nodeFactory:nodeFactory,
                    beforeStartConnect:function(node) {
                        // limit edges from start node to 1. if any other type of node, return
                        return (node.data.type === "start" && node.getEdges().length > 0) ? false : { label:"..." };
                    }
                },
                renderParams:{
                    layout:{
                        type:SpringLayout.type
                    },
                    plugins: [
                        DrawingToolsPlugin.type,
                        {
                            type:LassoPlugin.type,
                            options:{
                                invert:true
                            }
                        }
                    ],
                    events:{
                        canvasClick:() => {
                            toolkit.clearSelection()
                            //edgeEditor.stopEditing();
                        }
                    },
                    consumeRightClick: false,
                    dragOptions: {
                        filter: ".jtk-draw-handle, .node-action, .node-action i"
                    },
                    zoomToFit:true,
                },
                view:{
                    nodes: {
                        "start": {
                            component:StartNode
                        },
                        "selectable": {
                            events: {
                                tap: (params) => {
                                    toolkit.toggleSelection(params.obj)
                                }
                            }
                        },
                        "question": {
                            parent: "selectable",
                            component:QuestionNode
                        },
                        "action": {
                            parent: "selectable",
                            component:ActionNode
                        },
                        "output":{
                            parent:"selectable",
                            component:OutputNode
                        }
                    },
                    edges: {
                        "default": {
                            anchor:"AutoDefault",
                            endpoint:"Blank",
                            connector: {type:"Orthogonal", options:{ cornerRadius: 5 } },
                            paintStyle: { strokeWidth: 2, stroke: "rgb(132, 172, 179)", outlineWidth: 3, outlineStroke: "transparent" },	//	paint style for this edge type.
                            hoverPaintStyle: { strokeWidth: 2, stroke: "rgb(67,67,67)" }, // hover paint style for this edge type.
                            events: {
                                "click":(p) => {
                                    // edgeEditor.startEditing(p.edge, {
                                    //     deleteButton:true,
                                    //     onMaybeDelete:(edge, connection, doDelete) => {
                                    //         dialogs.show({
                                    //             id: "dlgConfirm",
                                    //             data: {
                                    //                 msg: "Delete Edge"
                                    //             },
                                    //             onOK: doDelete
                                    //         });
                                    //     }
                                    // });
                                }
                            },
                            overlays: [
                                { type:"Arrow", options:{ location: 1, width: 10, length: 10 } }
                            ]
                        },
                        "connection":{
                            parent:"default",
                            overlays:[
                                {
                                    type: "Label",
                                    options: {
                                        label: "${label}",
                                        events: {
                                            click: editEdge
                                        }
                                    }
                                }
                            ]
                        }
                    },

                    ports: {
                        "start": {
                            edgeType: "default"
                        },
                        "source": {
                            maxConnections: -1,
                            edgeType: "connection"
                        },
                        "target": {
                            maxConnections: -1,
                            isTarget: true,
                            dropOptions: {
                                hoverClass: "connection-drop"
                            }
                        }
                    }
                }
            })
        },

        methods:{
        },

        mounted() {
            console.log("mounted")
            toolkitComponent = this.$refs.toolkitComponent;
            toolkit = toolkitComponent.toolkit;

            dialogs = Dialogs.newInstance({
                selector: ".dlg"
            });

            // toolkit.addNode({
            //     id:"1",
            //     type:"start",
            //     left:50,
            //     top:50,
            //     w:100,
            //     h:100,
            //     text:"Start"
            // })
        }

    }

</script>
