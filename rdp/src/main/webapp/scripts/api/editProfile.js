   /**
    * @memberOf editProfile
    */
(function( editProfile, $, undefined ) {

	editProfile.closeProfileModal = function() {
	   utility.hideMessage( $( "#primaryContactMessage" ) );
	   
	};
	
	editProfile.saveResearcher = function() {
        var form = $( "#primaryContactForm" );
        researcherModel.currentResearcher.firstName = form.find( "#firstName" ).val();
        researcherModel.currentResearcher.lastName = form.find( "#lastName" ).val();
        researcherModel.currentResearcher.department = form.find( "#department" ).val();
        researcherModel.currentResearcher.organization = form.find( "#organization" ).val();
        researcherModel.currentResearcher.website = form.find( "#website" ).val();
        researcherModel.currentResearcher.phone = form.find( "#phone" ).val();
        researcherModel.currentResearcher.description = form.find( "#description" ).val();
       
        var promise = researcherModel.saveResearcherProfile();
        
        var btns = $( "#submit" );
        btns.attr("disabled", "disabled");
      
        $.when(promise).done(function() {
           btns.removeAttr("disabled");
           utility.showMessage( promise.responseJSON.message, $( "#primaryContactMessage" ) );
         promise = researcherModel.loadResearcher();
         $.when(promise).done(function() {
            overview.showProfile();
            editProfile.fillForm();
         });
        });
	}
	
	editProfile.fillForm = function() {
        var form = $( "#primaryContactForm" );
        form.find( "#firstName" ).val( researcherModel.currentResearcher.firstName );
        form.find( "#lastName" ).val( researcherModel.currentResearcher.lastName );
        form.find( "#department" ).val( researcherModel.currentResearcher.department );
        form.find( "#organization" ).val( researcherModel.currentResearcher.organization );
        form.find( "#website" ).val( researcherModel.currentResearcher.website );
        form.find( "#phone" ).val( researcherModel.currentResearcher.phone );
        form.find( "#description" ).val( researcherModel.currentResearcher.description );
	}
	

}( window.editProfile = window.editProfile || {}, jQuery ));

$( document ).ready( function() {
	$( "#submit" ).click( editProfile.saveResearcher );
	$( '#editProfileModal' ).on( 'hidden.bs.modal', editProfile.closeProfileModal );
	$( '#editProfileModal' ).on( 'show.bs.modal', editProfile.fillForm );
	
	
});