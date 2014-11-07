/**
 * @memberOf goManager
 */
(function( goManager, $, undefined ) {
   
   goManager.aspectToString = function(aspect) {
      switch(aspect) {
         case "BIOLOGICAL_PROCESS":
            return "BP";
         case "CELLULAR_COMPONENT":
             return "CC";
         case "MOLECULAR_FUNCTION":
            return "MF";
         default:
            return "";
     }

   }
   goManager.table = function() {
      return $( '#go-tab table');
   }; 
   
   goManager.currentTaxon = function() {
      return $( '#currentOrganismBreadcrumb').text();
   };

   goManager.currentTaxonId = function() {
      return utility.taxonNameToId[ $( '#currentOrganismBreadcrumb').text() ];
   };  
   
   goManager.addTermsModal = function() {
      return $( '#addTermsModal');
   };  
   
   goManager.suggestionTable = function() {
      return $( '#suggestedTermsTable');
   };  
   
   goManager.select2 = function() {
      return $( "#searchTermsSelect" );
   }; 
   
   goManager.loadSuggestedGOTerms = function() {
      return utility.executeAjax( "getRelatedTerms.html", {'minimumFrequency':2,'minimumTermSize':10,'maximumTermSize':100,'taxonId':modelOrganisms.currentTaxonId()} );
   }
   
   getGOTermStats = function(geneOntologyId) {
      return utility.executeAjax( "getGOTermStats.html", {'geneOntologyId':geneOntologyId, 'taxonId':modelOrganisms.currentTaxonId()}, false );
   }

   saveGoTerms = function() {      
      modelOrganisms.lockAll();
      if (!goManager.isChanged() ) {
         // no changes
         return null;
      }
      var btn = $(this);
      btn.attr("disabled", "disabled");
      btn.children('i').addClass('fa-spin');

      var researcher = researcherModel.currentResearcher;
      
      var taxonId = modelOrganisms.currentTaxonId();
      var newTerms = goManager.table().DataTable().columns().data()[0];
      
      researcher.addTaxonDescription(taxonId, modelOrganisms.focus().text() )
      researcher.updateTermsForTaxon( newTerms, taxonId );
      var promise = researcherModel.saveResearcherTermsForTaxon( taxonId );

      $.when(promise).done(function() {
         btn.removeAttr("disabled");
         btn.children('i').removeClass('fa-spin');
         console.log("Saved Changes");
         utility.showMessage( promise.responseJSON.message, $( "#modelOrganisms .main-header .alert div" ) );
         //utility.showMessage( promise.responseJSON.message, $( "#primaryContactMessage" ) );
      });
      
      
   }
   
   goManager.isChanged = function() {
      var table = goManager.table().DataTable();
      var researcher = researcherModel.currentResearcher;
      var taxonId = modelOrganisms.currentTaxonId();
      var oldTerms = researcher.terms[ taxonId ] || [];

      var showingTerms = table.columns().data()[0]; 
      var focus = researcher.taxonDescriptions[taxonId] ? researcher.taxonDescriptions[taxonId]:"";
      
      return ( modelOrganisms.focus().text() != focus) || !researcher.compareTerms(showingTerms, oldTerms);
   }
   
   goManager.loadTable = function() {
      var dTable = goManager.table().DataTable();
      var terms = researcherModel.currentResearcher.terms[ modelOrganisms.currentTaxonId() ] || [];
      goManager.fillTable(terms, dTable);
   }
   
   goManager.fillTable = function(terms, dTable) {
      dTable.clear();
      for ( var i = 0; i < terms.length; i++ ) {
         var termRow = [terms[i]];
         dTable.row.add( termRow );
      }
      dTable.draw();
   }
   
   goManager.selectGoTerm = function(terms) {
      var term = goManager.select2().select2( "data" );
      goManager.select2().select2( "val", "" );
      
      goManager.closeAddTermsModal();
      
      var inst = goManager.addGoTermToTable(term, true)
      
      if (inst) {
      
         var promise = getGOTermStats( term.geneOntologyId );
         
         $.when(promise).done(function() {
            term.size = promise.responseJSON.geneSize;
            term.frequency = promise.responseJSON.frequency;
            inst.invalidate().draw();
         });
      }
      
      
      
   }
   
   goManager.addGoTermToTable = function( term, draw ) {
      draw = utility.isUndefined( draw ) ? true : draw;

      if ( term == null ) {
         console.log("Please select a GO Term to add")
         //utility.showMessage( "Please select a gene to add", $( "#geneManagerMessage" ) );
         return;
      } else {
         //utility.hideMessage( $( "#geneManagerMessage" ) );
      }

      var table = goManager.table().DataTable();
      
      if ( table.column(1).data().indexOf(term.geneOntologyId) != -1 ) {
         console.log("GO Term already added")
         //utility.showMessage( "Gene already added", $( "#geneManagerMessage" ) );
         return;
      }
      var row = [term];
      var inst = table.row.add( row );
      if (draw) {
         inst.draw();
      }
      
      return inst

   }
   
   goManager.openAddTermsModal = function() {
      var dTable = goManager.suggestionTable().DataTable();
      dTable.clear();
      dTable.settings()[0].oLanguage.sEmptyTable = 'Searching for GO term suggestions <img src="styles/select2-spinner.gif">';
      dTable.draw();
      var promise = goManager.loadSuggestedGOTerms();
      goManager.addTermsModal().modal('show');
      $.when(promise).done(function() {
         // When done loading Go Terms
         dTable.settings()[0].oLanguage.sEmptyTable = "Could not find any GO term suggestions";
         var terms = promise.responseJSON.terms;
         //goManager.combineWithSavedTerms(terms);
         console.log("GO Terms", terms);
         
         goManager.fillTable(terms, dTable);
      });
      
   }
   
   goManager.closeAddTermsModal =  function() {
      goManager.addTermsModal().modal('hide');
   }
   
   
   goManager.removeSelectedRows = function() {
      var table = goManager.table().DataTable();
      var selectedNodes = table.rows( '.selected' );
      if ( selectedNodes.data().length == 0 ) {
         console.log("Please select a genes to remove")
         //utility.showMessage( "Please select a gene to remove", $( "#geneManagerMessage" ) );
         return;
      } else {
         //utility.hideMessage( $( "#geneManagerMessage" ) );
      }
      var data = selectedNodes.data();
      selectedNodes.remove().draw( false );
   }
   
   goManager.addHighlightedTerms = function() {
      var dTable = goManager.suggestionTable().DataTable();
      var selectedNodes = dTable.rows( '.selected' );
      if ( selectedNodes.data().length == 0 ) {
         console.log("Please select a terms to add")
         //utility.showMessage( "Please select a gene to remove", $( "#geneManagerMessage" ) );
         return;
      } else {
         //utility.hideMessage( $( "#geneManagerMessage" ) );
      }
      var data = selectedNodes.data();
      goManager.closeAddTermsModal();
      
      for (var i=0;i<data.length;i++) {
         goManager.addGoTermToTable(data[i][0], false)
      }
      goManager.table().DataTable().rows().draw();
      
   }

   goManager.initDataTable = function(table, buttons) {
      // Initialize datatable
      table.dataTable( {
         "oLanguage": {
            //"sEmptyTable": 'Searching for GO term suggestions <img src="styles/select2-spinner.gif">'
            "sEmptyTable": 'No Gene Ontology terms have been added'
          },
         "order": [ 4, "desc" ],
         "aoColumnDefs": [ 
                          {
                             "aTargets": [ 0 ],
                             "defaultContent": "",
                             "visible":false,
                             "searchable":false
                          },
                          {
                             "aTargets": [ 1 ],
                             "defaultContent": "",
                             "mData": function ( source, type, val ) {
                                return utility.isUndefined( source[0].geneOntologyId ) ? "" : source[0].geneOntologyId;
                             }
                          },
                          {
                             "aTargets": [ 2 ],
                             "defaultContent": "",
                             "mData": function ( source, type, val ) {
                                return utility.isUndefined( source[0].aspect ) ? "" : source[0].aspect;
                             }
                          },
                          {
                             "aTargets": [ 3 ],
                             "defaultContent": "",
                             "mData": function ( source, type, val ) {
                                return utility.isUndefined( source[0].geneOntologyTerm ) ? "" : source[0].geneOntologyTerm;
                             }
                          },
                          {
                             "aTargets": [ 4 ],
                             "mData": function ( source, type, val ) {
                                return utility.isUndefined( source[0].frequency ) ? "" : source[0].frequency;
                             }
                          },
                          {
                             "aTargets": [ 5 ],
                             "defaultContent": "",
                             "mData": function ( source, type, val ) {
                                return utility.isUndefined( source[0].size ) ? "" : source[0].size;
                             }
                          }],
                          "searching": false,
                          dom: 'T<"clear">lfrtip',
                          tableTools: {
                             "sRowSelect": "os",
                             "aButtons": buttons
                          },
                          "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
                             // Keep in mind that $('td:eq(0)', nRow) refers to the first DISPLAYED column
                             // whereas aData[0] refers to the data in the first column, hidden or not
                             var url = "http://www.ebi.ac.uk/QuickGO/GTerm?id="+aData[0].geneOntologyId+"#term=ancchart";
                             var link;
                             if ( aData[0].definition ) {
                                link = '<a href="'+url+'" data-content="' + aData[0].definition + '" data-container="body" data-toggle="popover" target="_blank">'+aData[0].geneOntologyId+'</a>';
                             }
                             else {
                                link = '<a href="'+url+'" data-content="Unknown Definition" data-container="body" data-toggle="popover" target="_blank">'+aData[0].geneOntologyId+'</a>';
                             }

                             $('td:eq(1)', nRow).html(goManager.aspectToString( aData[0].aspect));
                             
                             $('td:eq(0)', nRow).html(link);
                             $('td:eq(0) > a', nRow).popover({
                                trigger: 'hover',
                                'placement': 'top'
                             });
                             
                             if ( utility.isUndefined( aData[0].size ) ) {
                                $('td:eq(4)', nRow).html('<img src="styles/select2-spinner.gif">');
                             }
                             
                             if ( utility.isUndefined( aData[0].frequency ) ) {
                                $('td:eq(3)', nRow).html('<img src="styles/select2-spinner.gif">');
                             }

                             return nRow;
                          },

      } );
   }
   

   goManager.initSelect2 = function() {
      // init search genes combo    
      goManager.select2().select2( {
         id : function(data) {
            return data.geneOntologyId;
         },
         placeholder : "Search for a GO Term",
         minimumInputLength : 3,
         ajax : {
            url : "searchGO.html",
            dataType : "json",
            data : function(query, page) {
               return {
                  query : query // search term
               }
            },
            results : function(data, page) {
               var GOResults = []
               for (var i = 0; i < data.data.length; i++) {
                  var term = data.data[i];
                  term.text = "<b>" + term.geneOntologyId + "</b> <i>" + goManager.aspectToString(term.aspect) + "</i> " +term.geneOntologyTerm;
                  GOResults.push(term);
               }
               return {
                  results : GOResults
               };
            },

         },
         formatAjaxError : function(response) {
            var msg = response.responseText;
            return msg;
         }, 
         // we do not want to escape markup since we are displaying html in results
         escapeMarkup : function(m) {
            return m;
         },
      } );
   }

   goManager.init = function() {
      $( "#addTermButton" ).click( goManager.selectGoTerm );
      $('#term-tab-save').click(saveGoTerms);
   }

}( window.goManager = window.goManager || {}, jQuery ));

$( document ).ready( function() {
   goManager.init();
   goManager.initDataTable( goManager.table(), [ {"sExtends":    "text", "fnClick":goManager.openAddTermsModal, "sButtonText": '<i class="fa fa-plus-circle green-icon"></i>&nbsp; Add Term(s)' },
                                           {"sExtends":    "text", "fnClick":goManager.removeSelectedRows, "sButtonText": '<i class="fa fa-minus-circle red-icon"></i>&nbsp; Remove Selected' },
                                           "select_all", 
                                           "select_none" ] );
   goManager.initDataTable( goManager.suggestionTable(), [ {"sExtends":    "text", "fnClick":goManager.addHighlightedTerms, "sButtonText": '<i class="fa fa-plus-circle green-icon"></i>&nbsp; Add Highlighted Term(s)' },
                                                           "select_none" ] );
   //goManager.initSuggestDataTable();
   goManager.initSelect2();
   //goManager.initSelect2();
   //$( "#goManagerButton" ).click( goManager.saveGoTerms );
   //$( "#goManagerAddTermButton" ).click( goManager.addGoTerm );
   //goManager.modal.on( 'hidden.bs.modal', goManager.closeModal );
   //goManager.modal.on( 'show.bs.modal', goManager.openModal );
   

});