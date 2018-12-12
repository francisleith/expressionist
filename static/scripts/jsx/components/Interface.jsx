var React = require('react')
var NonterminalList = require('./NonterminalList.jsx')
var MarkupBar = require('./MarkupBar.jsx')
var findIndex = require('lodash/array/findIndex')
var ajax = require('jquery').ajax
var RuleBar = require('./RuleBar.jsx')
var NonterminalBoard = require('./NonterminalBoard.jsx')
var RuleBoard = require('./RuleBoard.jsx')
var FeedbackBar = require('./FeedbackBar.jsx')
var HeaderBar = require('./HeaderBar.jsx')
var Modal = require('react-bootstrap').Modal
var Button = require('react-bootstrap').Button
import { Router, browserHistory } from 'react-router'

class Interface extends React.Component {

    constructor(props) {
        super(props);
        this.updateFromServer = this.updateFromServer.bind(this);
        this.updateHistory = this.updateHistory.bind(this);
        this.updateCurrentNonterminal = this.updateCurrentNonterminal.bind(this);
        this.updateCurrentRule = this.updateCurrentRule.bind(this);
        this.updateMarkupFeedback = this.updateMarkupFeedback.bind(this);
        this.updateExpansionFeedback = this.updateExpansionFeedback.bind(this);
        this.getexpansion = this.getexpansion.bind(this);
        this.openRuleDefinitionModal = this.openRuleDefinitionModal.bind(this);
        this.closeRuleDefinitionModal = this.closeRuleDefinitionModal.bind(this);
        this.state = {
            nonterminals: [],
            markups: [],
            system_vars: [],
            expansion_feedback: "",
            markup_feedback: [],
            current_nonterminal: "",
            current_rule: -1,
            ruleDefinitionModalIsOpen: false,
            idOfRuleToEdit: null
        }
    }

    componentDidMount() {
        window.onpopstate = this.onBackButtonEvent;
        if( this.props.params.nonterminalid != null)
        {
            this.setState({current_nonterminal: this.props.params.nonterminalid})
            if( this.props.params.ruleid != null)
            {
                this.setState({current_rule: this.props.params.ruleid})
            }
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/default',
            dataType: 'json',
            cache: false,
            success: (data) => {
                this.setState({
                    nonterminals: data['nonterminals'],
                    markups: data['markups'],
                    system_vars: data['system_vars'],
                })
            },
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }

    onBackButtonEvent(e){
        e.preventDefault();
        //this.goBack()
        var nonterminal = this.props.params.nonterminalid
        var rule = this.props.params.ruleid
        if (!(this.state.current_nonterminal == nonterminal && this.state.current_rule == rule)){
            this.setState({markup_feedback: []})
            this.setState({expansion_feedback: ""})
        }
        this.setState({current_nonterminal: nonterminal})
        this.setState({current_rule: rule})
    }

    updateFromServer() {
        ajax({
            url: $SCRIPT_ROOT + '/api/default',
            dataType: 'json',
            cache: false,
            success: (data) => {
                this.setState({nonterminals: data['nonterminals']})
                this.setState({markups: data['markups']})
                this.setState({system_vars: data['system_vars']})
            },
            error: (xhr, status, err) => {
                console.error(this.props.url, status, err.toString())
            }
        });
    }

    updateHistory(nonterminal, rule){
        if( nonterminal != '') {
            browserHistory.push('/'+nonterminal+'/'+String(rule))
        } else {
            browserHistory.push('/')
        }
    }

    updateCurrentNonterminal(newTagOrNonterminal){
        this.setState({current_nonterminal: newTagOrNonterminal});
    }

    updateCurrentRule(newCurrentRule){
        this.setState({current_rule: newCurrentRule});
    }

    updateMarkupFeedback(newMarkupFeedback){
        this.setState({markup_feedback: newMarkupFeedback});
    }

    updateExpansionFeedback(newExpansionFeedback){
        this.setState({expansion_feedback: newExpansionFeedback});
    }

    getexpansion(object) {
        var symbol = object['symbol']
        var index = object['index']
        return {"symbol": symbol, "index": index, "expansion": this.state.nonterminals[symbol].rules[index].expansion.join("")}
    }

    openRuleDefinitionModal(idOfRuleToEdit) {
        this.setState({ruleDefinitionModalIsOpen: true});
        this.setState({idOfRuleToEdit: idOfRuleToEdit});
    }

    closeRuleDefinitionModal() {
        this.setState({ruleDefinitionModalIsOpen: false});
        this.setState({idOfRuleToEdit: null});
    }

    render() {
        var def_rules = []
        var board
        var referents
        if (this.state.current_nonterminal in this.state.nonterminals) {
            var current = this.state.nonterminals[this.state.current_nonterminal]
            def_rules = this.state.nonterminals[this.state.current_nonterminal].rules
            // Check which board we need to render
            if (this.state.current_rule == -1 || current.rules[this.state.current_rule] == null ) {
                var referents = []
                if ("referents" in current)  {
                    var referents = current["referents"];
                    referents = referents.map(this.getexpansion.bind(this))
                }

                board = <NonterminalBoard   updateMarkupFeedback={this.updateMarkupFeedback}
                                            updateExpansionFeedback={this.updateExpansionFeedback}
                                            updateHistory={this.updateHistory}
                                            currentRule={this.state.current_rule}
                                            updateFromServer={this.updateFromServer}
                                            updateCurrentNonterminal={this.updateCurrentNonterminal}
                                            updateCurrentRule={this.updateCurrentRule}
                                            referents={referents}
                                            name={this.state.current_nonterminal}
                                            nonterminal={this.state.nonterminals[this.state.current_nonterminal]}/>
            }
            else {
                board = <RuleBoard  name={this.state.current_nonterminal}
                                    currentRule={this.state.current_rule}
                                    updateFromServer={this.updateFromServer}
                                    updateCurrentNonterminal={this.updateCurrentNonterminal}
                                    updateCurrentRule={this.updateCurrentRule}
                                    updateMarkupFeedback={this.updateMarkupFeedback}
                                    updateExpansionFeedback={this.updateExpansionFeedback}
                                    updateHistory={this.updateHistory}
                                    expansion={def_rules[this.state.current_rule].expansion}
                                    app_rate={def_rules[this.state.current_rule].app_rate}
                                    openRuleDefinitionModal={this.openRuleDefinitionModal}/>
            }
        }

        return (
            <div style={{position: "fixed", top: 0, right: 0, "height": "100%", "width": "100%"}}>
                <div
                    style={{ "height": "70%", "width": "75%", position: "absolute", top: 0, left: 0}}>
                    <HeaderBar  updateCurrentNonterminal={this.updateCurrentNonterminal}
                                updateCurrentRule={this.updateCurrentRule}
                                updateMarkupFeedback={this.updateMarkupFeedback}
                                updateExpansionFeedback={this.updateExpansionFeedback}
                                updateHistory={this.updateHistory}
                                update={this.updateFromServer}
                                systemVars={this.state.system_vars}/>
                    <div className="muwrap">
                        <div className="show-y-wrapper">
                            <MarkupBar  className="markup-bar"
                                        currentNonterminal={this.state.current_nonterminal}
                                        updateFromServer={this.updateFromServer}
                                        nonterminals={this.state.nonterminals}
                                        total={this.state.markups}/>
                        </div>
                    </div>
                    {board}
                    <div className="muwrap" style={{"position": "absolute", "bottom": 0}}>
                        <RuleBar    rules={def_rules}
                                    updateFromServer={this.updateFromServer}
                                    nonterminals={this.state.nonterminals}
                                    name={this.state.current_nonterminal}
                                    updateCurrentNonterminal={this.updateCurrentNonterminal}
                                    updateCurrentRule={this.updateCurrentRule}
                                    updateMarkupFeedback={this.updateMarkupFeedback}
                                    updateExpansionFeedback={this.updateExpansionFeedback}
                                    updateHistory={this.updateHistory}
                                    closeRuleDefinitionModal={this.closeRuleDefinitionModal}
                                    ruleDefinitionModalIsOpen={this.state.ruleDefinitionModalIsOpen}
                                    idOfRuleToEdit={this.state.idOfRuleToEdit}/>
                    </div>
                </div>

                <div
                    style={{"overflow": "auto", "width": "25%", "height":"100%", position: "absolute", top: 0, right: 0, "border": "10px solid #f2f2f2", "borderTop": "4px solid rgb(242, 242, 242)"}}>
                    <NonterminalList    nonterminals={this.state.nonterminals}
                                        updateFromServer={this.updateFromServer}
                                        updateCurrentNonterminal={this.updateCurrentNonterminal}
                                        updateHistory={this.updateHistory}
                                        updateCurrentRule={this.updateCurrentRule}
                                        updateMarkupFeedback={this.updateMarkupFeedback}
                                        updateExpansionFeedback={this.updateExpansionFeedback}>
                    </NonterminalList>
                </div>
                <div style={{"width": "75%", "height": "30%", position: "absolute", bottom: 0, left:0}}>
                    <FeedbackBar derivation={this.state.expansion_feedback} markup={this.state.markup_feedback}/>
                </div>
            </div>
        );
    }
}

module.exports = Interface;
