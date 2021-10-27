var idUsuario = "";
var vNombres = "";
var vTipDoc = "";
var vDNI = "";
var vCodigo = "";
var vCorreo = "";
var vFecNacimiento = "";
var vEmpresa = "";
var SaveType = "Update"
var ID = "";
var ESTADO = "";
var TIPOPER = "";
var ENTIDAD = "";
var ListEntidades = [];
var waitDialog;
var msgDialog;
var NUM_CUENTA = "";
var COD_BANK = "";

$( document ).ready(function() {
    console.log( "ready!" );
});

$(function(){

	$('#divControles').hide();

	$('.tipOper').click(function(){		
	//$('#selTipoOper').change(function(){
		$('#selecTipOper').hide();
		$('#formulario').show();
		$('#divControles').show();
		
		if($(this).attr('id') == 'btnApertura'){			
		//if($('#selTipoOper').val() == 'Apertura'){
			TIPOPER = "Apertura";
			$('#tdEntidadOrigen').find('span.negro').html('Entidad');
			$('#tdMonedaOrigen').find('span.negro').html('Moneda');
			$('#tdEntidadOrigen').children().show();
			$('#tdMonedaOrigen').children().show();
			$('#tdEntidadDestino').children().hide();
			$('#tdMonedaDestino').children().hide();
			$('#tdCuentaCts').children().hide();
			$('#textoCTS1').children().hide();
			$('#textoCTS2').children().show();
			$('.emptyCol').hide();
		}else{
			$('#tdEntidadOrigen').find('span.negro').html('Entidad de origen');
			$('#tdMonedaOrigen').find('span.negro').html('Moneda de origen');
			$('#tdEntidadOrigen').children().show();
			$('#tdMonedaOrigen').children().show();
			$('#tdEntidadDestino').children().show();
			$('#tdMonedaDestino').children().show();
			$('#tdCuentaCts').children().show();
			$('#textoCTS1').children().show();
			$('#textoCTS2').children().hide();
			$('.emptyCol').show();
			
			if($(this).attr('id') == 'btnTraslado'){
				TIPOPER = "Traslado";
			}else if($(this).attr('id') == 'btnUnificacion'){
				TIPOPER = "Unificación";
			}else if($(this).attr('id') == 'btnCambioMoneda'){
				TIPOPER = "Cambio de moneda";
			}
		}
		
		$('#DivTipOper').html(TIPOPER);
		
		var sol = $.grep(ListEntidades, function(e){ return e.codSol == COD_BANK; });
		var dol = $.grep(ListEntidades, function(e){ return e.codDol == COD_BANK; });
		var monResult = "";
		if(sol.length > 0){
			$('#selEntidadOrigen option').filter(function() {
			    return $(this).text() == sol[0].desc; 
			}).prop('selected', true);
			monResult = "Soles";
		}else if(dol.length > 0){
			$('#selEntidadOrigen option').filter(function() {
			    return $(this).text() == dol[0].desc; 
			}).prop('selected', true);
			monResult = "Dólares";
		}
		$('#selMonedaOrigen').val(monResult);
		$('#sp_selMonedaOrigen').html(monResult);
		if(TIPOPER != 'Apertura'){
			$('#selMonedaOrigen').hide();
			$('#selEntidadOrigen').hide();
		}else{
			$('#selMonedaOrigen').show();
			$('#selEntidadOrigen').show();
			$('#sp_selMonedaOrigen').hide();
			$('#sp_selEntidadOrigen').hide();
		}
		$('#sp_selEntidadOrigen').html($('#selEntidadOrigen option:selected').text());
		
	});
	
	$('#btnRegresar').click(function(){
		$('#selecTipOper').show();
		$('#formulario').hide();
	});
	
	$('#selConfirma').change(function(){
		if($('#selConfirma').val() == "Si"){
			$('#trConfirma4').hide();
			$('#trConfirma2').show();
			$('#trConfirma2').css('opacity','1');
			$('#trConfirma2').find('input').prop('disabled', false);
			if(ENTIDAD == 'BCP' || ENTIDAD == 'INTERBANK' || ENTIDAD == 'BANBIF' || ENTIDAD == 'SCOTIABANK'){
				$('#trConfirma3').css('opacity','1');
				$('#trConfirma3').find('input').prop('disabled', false);
				$('#trConfirma3').show();
			}else{
				$('#trConfirma3').hide();
			}
		}else if($('#selConfirma').val() == "No"){
			$('#trConfirma2').hide();			
			$('#trConfirma3').hide();
			$('#trConfirma4').show();
			$('#subTr').hide();
		}else{
			$('#trConfirma2').css('opacity','0.5');
			$('#trConfirma2').show();
			$('#trConfirma2').find('input').prop('disabled', true);
			if(ENTIDAD == 'BCP' || ENTIDAD == 'INTERBANK' || ENTIDAD == 'BANBIF' || ENTIDAD == 'SCOTIABANK'){				
				$('#trConfirma3').css('opacity','0.5');
				$('#trConfirma3').show();
				$('#trConfirma3').find('input').prop('disabled', true);
				$('#trConfirma3').show();
			}else{
				$('#trConfirma3').hide();
			}
			$('#trConfirma4').hide();
		}
	});
	
	$('#selMot').change(function(){
		if($('#selMot').val() == 'Otro'){
			$('#subTr').show();
		}else{
			$('#subTr').hide();
		}
	});
	
	$('#txtNroCuenta').keydown(function (e) {
		numericField(e);
	});	
	
	$('#txtCCI').keydown(function (e) {
		numericField(e);
	});
		
	$('#btnEnviar').click(function(){
		Guardar();
	});
	
	$('#btnExport').click(function(){
		Exportar();
	});
	
	getDatosUsuario();
	
	$().SPServices({
		operation: "GetGroupCollectionFromUser",
		userLoginName: $().SPServices.SPGetCurrentUser(),
		async: false,
		completefunc: function (xData, Status) {
			if ($(xData.responseXML).find("Group[Name='Gestión Administrativa CTS']").length == 1){
				$('#DivForm').append('<input id="btnRegPnlAdm" type="button" value="Ir al panel de administración" style="margin-top:20px !important;"/>');
				$('#btnRegPnlAdm').click(function () {
					window.location.href = "/sites/rimachome/cts/SitePages/Panel%20de%20Administración.aspx";
				});
			}
		}
	});

});

function getDatosUsuario(){	
	$().SPServices({
		operation: "GetListItems",
	    async: false,
	    listName: 'Colaboradores',
	    webURL: "https://rimacsegurosperu.sharepoint.com/sites/rimachome/",
	    CAMLViewFields: "<ViewFields><FieldRef Name='Empresa'/><FieldRef Name='Nombres'/><FieldRef Name='ApellidoPaterno'/><FieldRef Name='ApellidoMaterno'/><FieldRef Name='DNI'/><FieldRef Name='Correo'/><FieldRef Name='C_x00f3_digo'/><FieldRef Name='FechaNacimiento'/><FieldRef Name='UserSP'/></ViewFields>",
	    CAMLQuery: "<Query><Where><Eq><FieldRef Name='Correo'/><Value Type='Text'>" + _spPageContextInfo.userLoginName + "</Value></Eq></Where></Query>",
	    completefunc: function (xData, Status) {
			$(xData.responseXML).SPFilterNode("z:row").each(function () {
				idUsuario = $(this).attr("ows_UserSP");
				vNombres = $(this).attr("ows_Nombres") + " " + $(this).attr("ows_ApellidoPaterno") + " " + $(this).attr("ows_ApellidoMaterno");
				vDNI = $(this).attr("ows_DNI");
				
				if(vDNI.length > 8){
					vTipDoc = "Carné de extranjería";
				}else{
					vTipDoc = "DNI";
				}
				
				vCodigo = $(this).attr("ows_C_x00f3_digo");
				vCorreo = $(this).attr("ows_Correo");
				vFecNacimiento = $(this).attr("ows_FechaNacimiento");vEmpresa 
				vEmpresa = $(this).attr("ows_Empresa");
								
				$('#spNombre').html(vNombres);
				//$('#spTipoDoc').html(vTipDoc);
				//$('#spDNI').html(vDNI);				
				//$('#spFecNac').html(vFecNacimiento );
				//$('#spCodigo').html(vCodigo);
			});
						
			if(vCorreo == ""){
				$('#btnEnviar').hide();
				alert("Error de conexión. Por favor intente luego.");
			}else{
			
				$().SPServices({
					operation: "GetListItems",
				    async: false,
				    listName: 'Datos CTS',
				    webURL: "https://rimacsegurosperu.sharepoint.com/sites/rimachome/cts/",
				    CAMLQuery: "<Query><Where><Eq><FieldRef Name='Correo'/><Value Type='Text'>" + _spPageContextInfo.userLoginName + "</Value></Eq></Where></Query>",
				    completefunc: function (xData, Status) {
				    	var count = 0;
						$(xData.responseXML).SPFilterNode("z:row").each(function () {
							NUM_CUENTA = $(this).attr('ows_CuentaCTS');
							COD_BANK = $(this).attr('ows_CodigoBanco');
							if($(this).attr("ows_Codigo")){
								vCodigo = $(this).attr("ows_Codigo");							
							}							
							$('#sp_cuentaCts').html(NUM_CUENTA);
							count++;						
						});
						CargarEntidades();
					}
				});
			}
		}
	});	
}

function CargarEntidades(){
	$().SPServices({
		operation: "GetListItems",
	    async: false,
	    listName: 'Entidades Financieras',
	    webURL: "https://rimacsegurosperu.sharepoint.com/sites/rimachome/cts/",
	    CAMLViewFields: "<ViewFields><FieldRef Name='Title'/><FieldRef Name='Descripci_x00f3_n'/><FieldRef Name='C_x00f3_digo_x0020_D_x00f3_lares'/></ViewFields>",
	    completefunc: function (xData, Status) {
	    	$('#selEntidadOrigen').append('<option value=""></option>');
	    	$('#selEntidadDestino').append('<option value=""></option>');
			$(xData.responseXML).SPFilterNode("z:row").each(function () {
				$('#selEntidadOrigen').append('<option value="' + $(this).attr('ows_Title') + '">' + $(this).attr('ows_Descripci_x00f3_n') + '</option>');
				$('#selEntidadDestino').append('<option value="' + $(this).attr('ows_Title') + '">' + $(this).attr('ows_Descripci_x00f3_n') + '</option>');
				
				var entidad = {
					desc: $(this).attr('ows_Descripci_x00f3_n') + "",
					codSol: $(this).attr('ows_Title') + "",
					codDol: ($(this).attr('ows_C_x00f3_digo_x0020_D_x00f3_lares')) ? ($(this).attr('ows_C_x00f3_digo_x0020_D_x00f3_lares') + "") : ($(this).attr('ows_Title') + "")
				};
				ListEntidades.push(entidad);
			});
			
			CargarSolicitud();
		}
	});
}

function CargarSolicitud(){
	$().SPServices({
		operation: "GetListItems",
	    async: false,
	    listName: 'Solicitudes',
	    webURL: "https://rimacsegurosperu.sharepoint.com/sites/rimachome/cts/",
	    CAMLQuery: "<Query><Where><Eq><FieldRef Name='Colaborador' LookupId='True'/><Value Type='Text'>" + _spPageContextInfo.userId + "</Value></Eq></Where><OrderBy><FieldRef Name='ID' Ascending='False'/></OrderBy></Query>",
	    completefunc: function (xData, Status) {
	    
	    	//debugger;
	    	var cont = 0;
	    	$('#trConfirma1').hide();
			$('#trConfirma2').hide();
			$('#trConfirma3').hide();
			$('#trConfirma4').hide();
			$('#trObservaciones').hide();
			$('#btnExport').hide();
			$('#msgImpresion').hide();
			$('.emptyCol').hide();
			
			$(xData.responseXML).SPFilterNode("z:row").each(function () {
				
				if(waitDialog){
					waitDialog.close(SP.UI.DialogResult.OK);
				}
				
				if(msgDialog){
					msgDialog.close(SP.UI.DialogResult.OK);
				}
				
				if($(this).attr('ows_Estado') != "Terminado"){				
					ID = $(this).attr('ows_ID');
					ESTADO = $(this).attr('ows_Estado');
					TIPOPER = $(this).attr('ows_Tipo_x0020_Operaci_x00f3_n');
					$('#DivTipOper').html(TIPOPER);				
					$('#divEstado').html(BetterCase($(this).attr('ows_Estado')));
								
				if($(this).attr('ows_Tipo_x0020_Operaci_x00f3_n') != 'Apertura'){
					$('#tdEntidadOrigen').find('span.negro').html('Entidad');
					$('#tdMonedaOrigen').find('span.negro').html('Moneda');
					$('#tdEntidadOrigen').children().show();
					$('#tdMonedaOrigen').children().show();
					$('#tdEntidadDestino').children().hide();
					$('#tdMonedaDestino').children().hide();
				}
				
				if($(this).attr('ows_Estado') == 'Devuelto por observaciones'){
					$('#paso1').toggleClass('activo', true);
					//$('#selTipoOper').val($(this).attr('ows_Tipo_x0020_Operaci_x00f3_n'));
					TIPOPER = $(this).attr('ows_Tipo_x0020_Operaci_x00f3_n');
					//$('#selTipoOper').trigger('change');
					var txtOrigen = $(this).attr('ows_Entidad_x0020_Origen');
					var txtDestino = $(this).attr('ows_Entidad_x0020_Destino');
					$('#selEntidadOrigen').val($('#selEntidadOrigen option').filter(function () { return $(this).html() == txtOrigen; }).val());								
					$('#selMonedaOrigen').val($(this).attr('ows_Moneda_x0020_Origen'));
					$('#selEntidadDestino').val($('#selEntidadDestino option').filter(function () { return $(this).html() == txtDestino; }).val());	
					$('#selMonedaDestino').val($(this).attr('ows_Moneda_x0020_Destino'));
					$('#trObservaciones div').html('<span class="spObserva">Observaciones:</span><br/>' + $(this).attr('ows_Observaciones'));
					$('#trObservaciones').show();
					$('#btnExport').show();
					$('#msgImpresion').show();				
				}else if($(this).attr('ows_Estado') == 'En proceso'){
					$('#trConfirma4').hide();
					$('#paso4').toggleClass('activo', true);
					$('#tdTipo').html("<td><span class='negro'>Tipo de solicitud:</span> " + $(this).attr('ows_Tipo_x0020_Operaci_x00f3_n') + "</td>");
					$('#tdEntidadOrigen').html("<td><span class='negro'>Entidad origen:</span><br/>" + $(this).attr('ows_Entidad_x0020_Origen') + "</td>");								
					$('#tdEntidadDestino').html("<td><span class='negro'>Entidad destino:</span><br/>" + $(this).attr('ows_Entidad_x0020_Destino') + "</td>");
					$('#tdMonedaOrigen').html("<td><span class='negro'>Moneda origen:</span><br/>" + $(this).attr('ows_Moneda_x0020_Origen') + "</td>");
					$('#tdMonedaDestino').html("<td><span class='negro'>Moneda destino:</span><br/>" + $(this).attr('ows_Moneda_x0020_Destino') + "</td>");
					$('#trConfirma1').show();
					var txtOrigen = $(this).attr('ows_Entidad_x0020_Origen');
					var txtDestino = $(this).attr('ows_Entidad_x0020_Destino');
					var to = $(this).attr('ows_Tipo_x0020_Operaci_x00f3_n');
					if(to != 'Apertura'){
						$('#trConfirma1').show();						
						ENTIDAD = txtDestino;
						if(txtDestino == 'BCP' || txtDestino == 'INTERBANK' || txtDestino == 'BANBIF' || txtDestino == 'SCOTIABANK'){
							$('#trConfirma3').show();
						}
						$('#selConfirma').trigger('change');												
					}else{
						$('#selConfirma option[value=Si]').attr('selected','selected');
						$('#selConfirma').trigger('change');
						$('#trConfirma1').hide();						
						ENTIDAD = txtOrigen;						
						if(txtOrigen == 'BCP' || txtOrigen == 'INTERBANK' || txtOrigen == 'BANBIF' || txtOrigen == 'SCOTIABANK'){
							$('#trConfirma3').show();						
						}						
					}
					//$('#btnExport').show();
					$('#divControles').show();
					$('#btnRegresar').hide();
					$('#btnExport').hide();
					$('#btnEnviar').val("Guardar");
					
					if($(this).attr('ows_Confirmar_x0020_Operaci_x00f3_n')){
						$('#selConfirma').val($(this).attr('ows_Confirmar_x0020_Operaci_x00f3_n'));
						$('#selConfirma').trigger('change');
					}
					
					$('#txtNroCuenta').val($(this).attr('ows_Cuenta_x0020_CTS_x0020_Nueva'));
					$('#selMot').val($(this).attr('ows_Motivo'));

					
				}else if($(this).attr('ows_Estado') == 'Terminado'){
					$('#tdTipo').html("<span class='negro'>Tipo de solicitud: </span> " + $(this).attr('ows_Tipo_x0020_Operaci_x00f3_n'));
					
					$('#tdEntidadOrigen').html("<span class='negro'>Entidad origen: </span>" + ($(this).attr('ows_Entidad_x0020_Origen') == null? "-" : $(this).attr('ows_Entidad_x0020_Origen') ) );	
												
					$('#tdEntidadDestino').html("<span class='negro'>Entidad destino: </span>" +($(this).attr('ows_Entidad_x0020_Destino') == null? "-" : $(this).attr('ows_Entidad_x0020_Destino')) );
					
					$('#tdMonedaOrigen').html("<span class='negro'>Moneda origen: </span>" + ($(this).attr('ows_Moneda_x0020_Origen') == null? "-" : $(this).attr('ows_Moneda_x0020_Origen')) );
					
					$('#tdMonedaDestino').html("<span class='negro'>Moneda destino: </span>" + ($(this).attr('ows_Moneda_x0020_Destino') == null? "-" : $(this).attr('ows_Moneda_x0020_Destino')) );
										
					var txtOrigen = $(this).attr('ows_Entidad_x0020_Origen');
					var txtDestino = $(this).attr('ows_Entidad_x0020_Destino');
					
					if($(this).attr('ows_Confirmar_x0020_Operaci_x00f3_n') == "Si"){
						$('#trConfirma1').html("<dic class='col'><span class='negro'>Confirma operaci&oacute;n: </span>" + $(this).attr('ows_Confirmar_x0020_Operaci_x00f3_n') + "</div>");
						$('#trConfirma1').show();
						$('#trConfirma2').html("<dic class='col'><span class='negro'>N&uacute;mero de cuenta: </span>" + $(this).attr('ows_Cuenta_x0020_CTS_x0020_Nueva') + "</div>");					
						$('#trConfirma2').show();
						if($(this).attr('ows_Tipo_x0020_Operaci_x00f3_n') != 'Apertura'){						
							ENTIDAD = txtDestino;
							if(txtDestino == 'BCP' || txtDestino == 'INTERBANK' || txtDestino == 'BANBIF' || txtDestino == 'SCOTIABANK'){
								$('#trConfirma3').html("<dic class='col'><span class='negro'>CCI: </span>" + $(this).attr('ows_CCI') + "</div>");
								$('#trConfirma3').show();
							}
						}else{
							ENTIDAD = txtOrigen;
							if(txtOrigen == 'BCP' || txtOrigen == 'INTERBANK' || txtOrigen == 'BANBIF' || txtOrigen == 'SCOTIABANK'){
								$('#trConfirma3').html("<dic class='col'><span class='negro'>CCI: </span>" + $(this).attr('ows_CCI') + "</div>");
								$('#trConfirma3').show();
							}						
						}							
					}else{
						$('#trConfirma1').html("<dic class='col'><span class='negro'>Confirma operaci&oacute;n: </span>" + $(this).attr('ows_Confirmar_x0020_Operaci_x00f3_n') + "</div>");
						$('#trConfirma1').show();
												
						$('#trConfirma4').html("<dic class='col'><span class='negro'>Motivo: </span>" + $(this).attr('ows_Motivo') + "</div>");
						$('#trConfirma4').show();
					}			
					
					$('#btnEnviar').hide();
					$('#btnExport').show();
				}else if($(this).attr('ows_Estado') == 'Recibido'){
					$('#paso3').toggleClass('activo', true);	
					$('#tdTipo').html("<span class='negro'>Tipo de solicitud:</span> " + $(this).attr('ows_Tipo_x0020_Operaci_x00f3_n'));
					$('#tdEntidadOrigen').html("<span class='negro'>Entidad origen:</span><br/>" + $(this).attr('ows_Entidad_x0020_Origen'));
					
					if($(this).attr('ows_Entidad_x0020_Destino')){								
						$('#tdEntidadDestino').html("<span class='negro'>Entidad destino:</span><br/>" + $(this).attr('ows_Entidad_x0020_Destino'));
					}
					
					$('#tdMonedaOrigen').html("<span class='negro'>Moneda origen:</span><br/>" + $(this).attr('ows_Moneda_x0020_Origen'));
					
					if($(this).attr('ows_Moneda_x0020_Destino')){
						$('#tdMonedaDestino').html("<span class='negro'>Moneda destino:</span><br/>" + $(this).attr('ows_Moneda_x0020_Destino'));
					}
					$('#btnEnviar').hide();
					$('#btnExport').show();		
					$('#msgImpresion').hide();				
				}else{
					$('#paso2').toggleClass('activo', true);
					$('#tdTipo').html("<td><span class='negro'>Tipo de solicitud:</span> " + $(this).attr('ows_Tipo_x0020_Operaci_x00f3_n') + "</td>");
					$('#tdEntidadOrigen').html("<td><span class='negro'>Entidad origen:</span><br/>" + $(this).attr('ows_Entidad_x0020_Origen') + "</td>");								
					$('#tdEntidadDestino').html("<td><span class='negro'>Entidad destino:</span><br/>" + $(this).attr('ows_Entidad_x0020_Destino') + "</td>");
					$('#tdMonedaOrigen').html("<td><span class='negro'>Moneda origen:</span><br/>" + $(this).attr('ows_Moneda_x0020_Origen') + "</td>");
					$('#tdMonedaDestino').html("<td><span class='negro'>Moneda destino:</span><br/>" + $(this).attr('ows_Moneda_x0020_Destino') + "</td>");
					$('#divControles').show();
					$('#btnRegresar').hide();
					$('#btnEnviar').hide();
					$('#btnExport').show();
					$('#msgImpresion').show();
				}
							
				cont++;
				
				}else{
					//alert('terminado');
					if($(this).attr("ows_Fecha_x0020_Sello") != null){
					var fecs = $(this).attr("ows_Fecha_x0020_Sello").split(' ')[0].split('-');
				    var fec = fecs[2] + "/" + fecs[1] + "/" + fecs[0];
					$('#divSolicitudesAnteriores').append('<div><b>&#x25CF;&nbsp;' + $(this).attr('ows_Tipo_x0020_Operaci_x00f3_n') + ' - ' + fec +  '</b></div>');
					}
					$('#DivAnteriores').show();
					
					
					//Terminado 
					
					
					/*$('#tdTipo').html("<span class='negro'>Tipo de solicitud: </span> " + $(this).attr('ows_Tipo_x0020_Operaci_x00f3_n'));
					
					$('#tdEntidadOrigen').html("<span class='negro'>Entidad origen: </span>" + ($(this).attr('ows_Entidad_x0020_Origen') == null? "-" : $(this).attr('ows_Entidad_x0020_Origen') ) );	
												
					$('#tdEntidadDestino').html("<span class='negro'>Entidad destino: </span>" +($(this).attr('ows_Entidad_x0020_Destino') == null? "-" : $(this).attr('ows_Entidad_x0020_Destino')) );
					
					$('#tdMonedaOrigen').html("<span class='negro'>Moneda origen: </span>" + ($(this).attr('ows_Moneda_x0020_Origen') == null? "-" : $(this).attr('ows_Moneda_x0020_Origen')) );
					
					$('#tdMonedaDestino').html("<span class='negro'>Moneda destino: </span>" + ($(this).attr('ows_Moneda_x0020_Destino') == null? "-" : $(this).attr('ows_Moneda_x0020_Destino')) );
										
					var txtOrigen = $(this).attr('ows_Entidad_x0020_Origen');
					var txtDestino = $(this).attr('ows_Entidad_x0020_Destino');
					
					
					if($(this).attr('ows_Confirmar_x0020_Operaci_x00f3_n') == "Si"){
						$('#trConfirma1').html("<dic class='col'><span class='negro'>Confirma operaci&oacute;n: </span>" + $(this).attr('ows_Confirmar_x0020_Operaci_x00f3_n') + "</div>");
						$('#trConfirma1').show();
						$('#trConfirma2').html("<dic class='col'><span class='negro'>N&uacute;mero de cuenta: </span>" + $(this).attr('ows_Cuenta_x0020_CTS_x0020_Nueva') + "</div>");					
						$('#trConfirma2').show();
						if($(this).attr('ows_Tipo_x0020_Operaci_x00f3_n') != 'Apertura'){						
							ENTIDAD = txtDestino;
							if(txtDestino == 'BCP' || txtDestino == 'INTERBANK' || txtDestino == 'BANBIF' || txtDestino == 'SCOTIABANK'){
								$('#trConfirma3').html("<dic class='col'><span class='negro'>CCI: </span>" + $(this).attr('ows_CCI') + "</div>");
								$('#trConfirma3').show();
							}
						}else{
							ENTIDAD = txtOrigen;
							if(txtOrigen == 'BCP' || txtOrigen == 'INTERBANK' || txtOrigen == 'BANBIF' || txtOrigen == 'SCOTIABANK'){
								$('#trConfirma3').html("<dic class='col'><span class='negro'>CCI: </span>" + $(this).attr('ows_CCI') + "</div>");
								$('#trConfirma3').show();
							}						
						}							
					}else{
						$('#trConfirma1').html("<dic class='col'><span class='negro'>Confirma operaci&oacute;n: </span>" + $(this).attr('ows_Confirmar_x0020_Operaci_x00f3_n') + "</div>");
						$('#trConfirma1').show();
												
						$('#trConfirma4').html("<dic class='col'><span class='negro'>Motivo: </span>" + $(this).attr('ows_Motivo') + "</div>");
						$('#trConfirma4').show();
					}			
					
					$('#btnEnviar').hide();
					$('#btnExport').show();*/

				}
			});
			
			if(cont > 0){								
				SaveType = "Update";
				$('#spEstVal').html("Tu solicitud se encuentra en el estado");
				
				if(ESTADO != 'Devuelto por observaciones'){
					$('#selecTipOper').hide();
				}
				
				if(TIPOPER == "Apertura"){
					$('#tdEntidadOrigen').find('span.negro').html('Entidad');
					$('#tdMonedaOrigen').find('span.negro').html('Moneda');
					$('#tdEntidadOrigen').children().show();
					$('#tdMonedaOrigen').children().show();
					$('#tdEntidadDestino').children().hide();
					$('#tdMonedaDestino').children().hide();
					$('#tdCuentaCts').children().hide();
					$('#textoCTS1').children().hide();
					$('#textoCTS2').children().show();
				}
			}else{
				$('#paso1').toggleClass('activo', true);
				SaveType = "New";
				$('#spEstVal').html("");
				$('#divEstado').html("Selecciona tu solicitud:");
				$('#tdEntidadOrigen').children().hide();
				$('#tdMonedaOrigen').children().hide();
				$('#tdEntidadDestino').children().hide();
				$('#tdMonedaDestino').children().hide();
				$('#tdCuentaCts').children().hide();
				$('#textoCTS1').children().hide();
				$('#textoCTS2').children().hide();
				$('.tipOper').tooltip();				
				
			}
			
			
				if($(this).attr('ows_Estado') == "Terminado"){	
				
				//debugger;
						$('#paso1').attr("class","paso");
						$('#paso2').attr("class","paso");
						$('#paso3').attr("class","paso");
						$('#paso4').attr("class","paso");
						
				
				}
			
			
			
			
			
			
		}		
	});
}

function Validar(){
	var flag = true;
	
	if(SaveType == "Update"){
		if(ESTADO == 'Devuelto por observaciones'){
			if(TIPOPER != 'Apertura'){
				//if($('#selTipoOper option:selected').val() == ""){ flag = false; }
				if($('#selEntidadOrigen option:selected').val() == ""){ flag = false; }
				if($('#selEntidadDestino option:selected').val() == ""){ flag = false; }
				if($('#selMonedaOrigen option:selected').val() == ""){ flag = false; }
				if($('#selMonedaDestino option:selected').val() == ""){ flag = false; }
			}else{
				//if($('#selTipoOper option:selected').val() == ""){ flag = false; }
				if($('#selEntidadOrigen option:selected').val() == ""){ flag = false; }
				if($('#selMonedaOrigen option:selected').val() == ""){ flag = false; }
			}
		}
		
		if(ESTADO == 'En proceso'){			
			
			if($('#selConfirma:visible').length > 0){
			
				if($('#selConfirma option:selected').val() == ""){ flag = false; }
			
				if($('#selConfirma option:selected').val() == "Si"){
				
					if($('#txtNroCuenta').val() == ""){ flag = false; }					
			
					if(ENTIDAD == 'BCP' || ENTIDAD == 'INTERBANK' || ENTIDAD == 'BANBIF' || ENTIDAD == 'SCOTIABANK'){
						if($('#txtCCI').val() == ""){ flag = false; }
					}
													
				}else{
					
					if($('#selMot option:selected').val() == ""){ flag = false; }
					if($('#selMot option:selected').val() == "Otro"){
						if($('#txtMot').val() == ""){ flag = false; }
					}	
				}
			}else{
				if($('#txtNroCuenta').val() == ""){ flag = false; }	
				if(ENTIDAD == 'BCP' || ENTIDAD == 'INTERBANK' || ENTIDAD == 'BANBIF' || ENTIDAD == 'SCOTIABANK'){
					if($('#txtCCI').val() == ""){ flag = false; }
				}
			}
		}
		
	}else{
		//if($('#selTipoOper option:selected').val() != 'Apertura'){
		if(TIPOPER != 'Apertura'){
			//if($('#selTipoOper option:selected').val() == ""){ flag = false; }
			if($('#selEntidadOrigen option:selected').val() == ""){ flag = false; }
			if($('#selEntidadDestino option:selected').val() == ""){ flag = false; }
			if($('#selMonedaOrigen option:selected').val() == ""){ flag = false; }
			if($('#selMonedaDestino option:selected').val() == ""){ flag = false; }
		}else{
			//if($('#selTipoOper option:selected').val() == ""){ flag = false; }
			if($('#selEntidadOrigen option:selected').val() == ""){ flag = false; }
			if($('#selMonedaOrigen option:selected').val() == ""){ flag = false; }
		}
	}
	
	return flag;
}

function Guardar(){
	
	if(Validar()){
				
		if(ESTADO == 'En proceso'){
			if($('#selConfirma option:selected').val() == "Si"){
				GuardarEnSerio();
			}else{
				var confi = true;
				var mMsg = "";
				if($('#selMot option:selected').val() != "Aún no está en la nueva entidad financiera"){
					mMsg = "Se dar&aacute; por culminado el flujo<br/>Ya no podr&aacute;s hacer cambios en este formulario.";
				}else{
					mMsg = "A&uacute;n no culmina el flujo.<br/>Por favor no olvides registrar tu número de cuenta CTS cuando la tengas.";
				}
				
				var cloneModalContent = document.createElement('div');
				$("#InformationBox #DivModalRec").html(mMsg);
				cloneModalContent.innerHTML = document.getElementById('InformationBox').innerHTML;
										
				var options = {
					title: "Guardar cambios",
					width: 650,
					height: 200,
					html: cloneModalContent,
					allowMaximize:false,
					dialogReturnValueCallback: function(dialogResult){
						if(dialogResult == 1){
							GuardarEnSerio();
						}
					}
				};	   
				SP.UI.ModalDialog.showModalDialog(options);   	
			}		
		}else{
			GuardarEnSerio();
		}
	}else{
		alert('Por favor completa todos los campos.');
	}	
}

function GuardarEnSerio(){
	waitDialog = SP.UI.ModalDialog.showWaitScreenWithNoClose("Enviando...", "", 70, 240);
		
		$('#divLoadHelper').show(1, function(){
			setTimeout(function() {
					
				var batch = "<Batch OnError='Continue'><Method ID='1' Cmd='" + SaveType + "'>";
				
				if(SaveType == "Update"){
					batch = batch + "<Field Name='ID'>" + ID + "</Field>";
					
					if(ESTADO == 'Devuelto por observaciones'){
						batch = batch + "<Field Name='Tipo_x0020_Operaci_x00f3_n'>" + TIPOPER + "</Field>";
						batch = batch + "<Field Name='Entidad_x0020_Origen'>" + $('#selEntidadOrigen option:selected').text() + "</Field>";
						batch = batch + "<Field Name='Moneda_x0020_Origen'>" + $('#selMonedaOrigen option:selected').val() + "</Field>";
						batch = batch + "<Field Name='Entidad_x0020_Destino'>" + $('#selEntidadDestino option:selected').text() + "</Field>";
						batch = batch + "<Field Name='Moneda_x0020_Destino'>" + $('#selMonedaDestino option:selected').val() + "</Field>";
						
						var entOrig = $.grep(ListEntidades, function(e){ return e.desc == $('#selEntidadOrigen option:selected').text(); });
						if(entOrig.length > 0){
							var codEnt = "";
							if($('#selMonedaOrigen option:selected').val() == "Soles"){
								codEnt = entOrig[0].codSol;
							}else{
								codEnt = entOrig[0].codDol;
							}
							batch = batch + "<Field Name='C_x00f3_digo_x0020_Entidad_x0020'>" + codEnt + "</Field>";
						}
						
						batch = batch + "<Field Name='Estado'>Pendiente de recepción</Field>";
						
					}else if(ESTADO == 'En proceso'){
						
						if($('#selConfirma:visible').length > 0){
							if($('#selConfirma option:selected').val() == "Si"){
								batch = batch + "<Field Name='Confirmar_x0020_Operaci_x00f3_n'>Si</Field>";
								batch = batch + "<Field Name='Cuenta_x0020_CTS_x0020_Nueva'>" + $('#txtNroCuenta').val() + "</Field>";
								if($('#txtCCI').val() != ""){
									batch = batch + "<Field Name='CCI'>" + $('#txtCCI').val() + "</Field>";
								}
								batch = batch + "<Field Name='Estado'>Terminado</Field>";
							}else{
								batch = batch + "<Field Name='Confirmar_x0020_Operaci_x00f3_n'>No</Field>";
								if($('#selMot option:selected').val() == "Otro"){
									batch = batch + "<Field Name='Motivo'>" + $('#txtMot').val() + "</Field>";
								}else{
									batch = batch + "<Field Name='Motivo'>" + $('#selMot option:selected').val() + "</Field>";									
									if($('#selMot option:selected').val() != "Aún no está en la nueva entidad financiera"){
										batch = batch + "<Field Name='Estado'>Terminado</Field>";
									}
								}
							}
						}else{
							batch = batch + "<Field Name='Confirmar_x0020_Operaci_x00f3_n'>Si</Field>";
							if($('#txtNroCuenta').val() != ""){
								batch = batch + "<Field Name='Cuenta_x0020_CTS_x0020_Nueva'>" + $('#txtNroCuenta').val() + "</Field>";
							}
							if($('#txtCCI').val() != ""){
								batch = batch + "<Field Name='CCI'>" + $('#txtCCI').val() + "</Field>";
							}
							batch = batch + "<Field Name='Estado'>Terminado</Field>";
						}
					}					
				}else{
					batch = batch + "<Field Name='Title'>Por asignar</Field>";
					batch = batch + "<Field Name='Colaborador'>-1;#" + vCorreo + "</Field>";
					batch = batch + "<Field Name='NombreCompleto'>" + vNombres + "</Field>";
					batch = batch + "<Field Name='Tipo_x0020_Documento'>" + vTipDoc + "</Field>";
					batch = batch + "<Field Name='Nro_x0020_Documento'>" + vDNI + "</Field>";
					batch = batch + "<Field Name='Empresa'>" + vEmpresa + "</Field>";
					batch = batch + "<Field Name='Fecha_x0020_Nacimiento'>" + vFecNacimiento + "</Field>";
					batch = batch + "<Field Name='C_x00f3_digo_x0020_Colaborador'>" + vCodigo + "</Field>";
					if(NUM_CUENTA != ""){
						batch = batch + "<Field Name='Cuenta_x0020_CTS_x0020_Origen'>" + NUM_CUENTA + "</Field>";
					}
					batch = batch + "<Field Name='Tipo_x0020_Operaci_x00f3_n'>" + TIPOPER + "</Field>";
					batch = batch + "<Field Name='Entidad_x0020_Origen'>" + $('#selEntidadOrigen option:selected').text() + "</Field>";
					batch = batch + "<Field Name='Moneda_x0020_Origen'>" + $('#selMonedaOrigen option:selected').val() + "</Field>";
					batch = batch + "<Field Name='Entidad_x0020_Destino'>" + $('#selEntidadDestino option:selected').text() + "</Field>";
					batch = batch + "<Field Name='Moneda_x0020_Destino'>" + $('#selMonedaDestino option:selected').val() + "</Field>";
					
					var entOrig = $.grep(ListEntidades, function(e){ return e.desc == $('#selEntidadOrigen option:selected').text(); });
					if(entOrig.length > 0){
						var codEnt = "";
						if($('#selMonedaOrigen option:selected').val() == "Soles"){
							codEnt = entOrig[0].codSol;
						}else{
							codEnt = entOrig[0].codDol;
						}
						batch = batch + "<Field Name='C_x00f3_digo_x0020_Entidad_x0020'>" + codEnt + "</Field>";
					}

					batch = batch + "<Field Name='Estado'>Pendiente de recepción</Field>";
					var td = new Date();
					batch = batch + "<Field Name='Fecha_x0020_de_x0020_Carga'>" + td.getFullYear() + "-" + ("0" + (td.getMonth() + 1)).slice(-2) + "-01 00:00:00" + "</Field>";
										
					batch = batch + "<Field Name='Fecha_x0020_L_x00ed_mite'>" + td.getFullYear() + "-" + ("0" + (td.getMonth() + 1)).slice(-2) + "-22 00:00:00" + "</Field>";
				}				
				
				batch = batch + "</Method></Batch>";
				
				$().SPServices({
					operation: "UpdateListItems",
					async: false,
					listName: "Solicitudes",
					updates: batch,
					completefunc: function ( xData, Status ) {	
						$(xData.responseXML).SPFilterNode('ErrorCode').each( function(){
							responseError = $(this).text();
			
							if (responseError === '0x00000000') {
								
								waitDialog.close(SP.UI.DialogResult.OK);                
								$('#btnEnviar').hide();	                    	                    
								var vHtml = "", vTit = "", vh = 130;
								
								var allEvents = xData.responseXML;
						    	$(allEvents).SPFilterNode("z:row").each(function () {			
									ID = $(this).attr("ows_ID");
								});
								
								if(ESTADO == 'En proceso'){
									vTit = "Datos guardados";
									vHtml = "<div id='DivModalRec2'>Datos guardados exitosamente.<br/>Gracias por actualizar la informaci&oacute;n.<br/>Para regresar haz clic <a style='font-weight:bold;' href='#' onclick='PageRefresh();'>aqu&iacute;</a>.</div>";
								}else{
									vh = 250;
									vTit = "Solicitud enviada";
									//vHtml = "<div id='DivModalRec2'>Debes enviar tu solicitud firmada en f&iacute;sico y una copia legible de tu DNI a Giorelly Rubina, por mensajería interna (Begonias 475-2do piso).<br/>Puedes volver a ingresar a esta p&aacute;gina para hacer seguimiento a tu solicitud.<br/>Exporta tu solicitud haciendo clic <a style='font-weight:bold;' href='#' onclick='Exportar();'>aqu&iacute;</a>.</div>";
									vHtml = "<div id='DivModalRec2'>Para recibir el correo hacer click <a style='font-weight:bold;' href='#' onclick='Exportar();'>AQU&Iacute;</a> (aprox  te llegará en 7 min).<br/>Luego podrás proceder con los requisitos indicados en el correo de acuerdo a tu entidad bancaria de origen.<br/>Puedes volver a ingresar a esta pagina para hacer seguimiento a tu solicitud.</div>";
								}
								$('body').append(vHtml);	
								var options = {
									title: vTit,
									width: 650,
									height: vh,
									html: document.getElementById("DivModalRec2"),
									allowMaximize:false,
									dialogReturnValueCallback: Function.createDelegate(null, CloseCallback)
								};	                    	
								msgDialog = SP.UI.ModalDialog.showModalDialog(options);

									
							}else {
								waitDialog.close(SP.UI.DialogResult.OK);
								alert("Error al guardar. Por favor intente luego.");
							}
						});
					}
				});
			
			}, 50);
		});	
}

function Exportar(){

	//waitDialog = SP.UI.ModalDialog.showWaitScreenWithNoClose("Exportando...", "", 70, 240);
	//$('#divLoadHelper').show(1, function(){
	//	setTimeout(function() {			
	//		window.location.href = "http://rstadsp01:88/cts/ExportPdf.aspx?tipo=solicitud&sid=" + ID;	
	//		getDatosUsuario();		
	//	}, 50);
	//});	
	
	waitDialog = SP.UI.ModalDialog.showWaitScreenWithNoClose("Enviando...", "", 70, 240);
		
		$('#divLoadHelper').show(1, function(){
			setTimeout(function() {
				
				var batch = "<Batch OnError='Continue'><Method ID='1' Cmd='New'>";
				batch = batch + "<Field Name='Title'>" + ID + "</Field>";
				batch = batch + "<Field Name='To'>" + vCorreo + "</Field>";
				batch = batch + "<Field Name='Subject'>GESTIÓN CTS</Field>";
				batch = batch + "<Field Name='Estado'>Pendiente</Field>";
				batch = batch + "<Field Name='Body'>" + TIPOPER + "</Field>";
				batch = batch + "</Method></Batch>";
				
				$().SPServices({
					operation: "UpdateListItems",
					async: false,
					listName: "NotificacionesSTMP",
					updates: batch,
					completefunc: function ( xData, Status ) {	
														
						waitDialog.close(SP.UI.DialogResult.OK);
						var vh = 250;
						var vTit = "CTS";
						var vHtml = "<div id='DivModalRec2'>Su solicitud ha sido enviada a su correo para que proceda con la firma virtual o de pu&nacute;o y letra. Luego, presenta tu solicitud firmada junto con tu copia de DNI a <a href='mailto:gdh_gestionadministrativa@rimac.com.pe'>gdh_gestionadministrativa@rimac.com.pe</a> o de forma presencial en la Mesa de Partes, <b>dependiendo de los requisitos de su entidad de CTS de origen que se detallan en las especificaciones de cada solicitud.</b></div>";
								
						$('body').append(vHtml);	
						var options = {
							title: vTit,
							width: 650,
							height: vh,
							html: document.getElementById("DivModalRec2"),
							allowMaximize:false,
							dialogReturnValueCallback: Function.createDelegate(null, CloseCallback)
						};	                    	
						msgDialog = SP.UI.ModalDialog.showModalDialog(options);							
					}
					
				});
			
			}, 50);
		});	

	
}

function CloseCallback(result, target) {
    PageRefresh();
}

function CloseConfirmCallback(result, target) {
	var flag = "";
    console.log("r: " + result + " | t: " + target);
    if(target == "Cancel"){
    	flag = false; 
    }else{
    	flag = true;
    }
    return flag;
}

function PageRefresh(){
	window.location.href = window.location.href;
}

function BetterCase(str){
	var strChunks = str.split(' ');
	var arrStr = [];
	$.each(strChunks, function(k, v){
		if(v.toLowerCase() == "de" || v.toLowerCase() == "por"){
			arrStr.push(v);
		}else{
			arrStr.push(jsUcfirst(v));
		}
	});
	return arrStr.join(' ');
}

function jsUcfirst(string) 
{
    return string.toLowerCase().charAt(0).toUpperCase() + string.toLowerCase().slice(1);
}

var arrFeriados = new Array();
arrFeriados.push('01/01');
arrFeriados.push('01/05');
arrFeriados.push('29/06');
arrFeriados.push('28/07');
arrFeriados.push('29/07');
arrFeriados.push('30/08');
arrFeriados.push('08/10');
arrFeriados.push('08/12');
arrFeriados.push('25/12');

function addDays(myDate,days) {
	return new Date(myDate.getTime() + days*24*60*60*1000);
}

function isWorkDay(dd){
	var flag = true;
	var d = new Date(dd);
	var dDay = d.getDate();
	if(dDay.toString().length > 1){dDay = dDay;}else{dDay = ("0" + dDay);}
	var dMonth = d.getMonth() + 1;
	if(dMonth.toString().length > 1){dMonth = dMonth;}else{dMonth = ("0" + dMonth);}
	if(d.getDay() == 0 || d.getDay() == 6){
		flag = false;
	}else{
		if($.inArray(dDay + "/" + dMonth,arrFeriados) > -1){
			flag = false;
		}
	}	
	return flag;
}

function fechaFin(day){
	var nextDay = new Date(day);
	for(var i = 0; i < 15; i++){
		nextDay = addDays(nextDay,1);
		var flag = false;
		while(flag == false){
			if(!isWorkDay(nextDay)){		
				nextDay = addDays(nextDay,1);
			}else{
				flag = true;
			}
		}
	}	
	
	var strFecha = nextDay.getFullYear() + "-" + ("0" + (nextDay.getMonth() + 1)).slice(-2) + "-" + ("0" + nextDay.getDate()).slice(-2) + " 00:00:00";
	
	return strFecha;
}

function numericField(e) {
		        // Allow: backspace, delete, tab, escape, enter and .
			if ($.inArray(e.keyCode, [46, 8, 9, 27, 13]) !== -1 ||
		    	(e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
		    	e.keyCode == 46 || e.keyCode == 8 ||
		        (e.keyCode >= 35 && e.keyCode <= 40)) {
		        	return;
		    }
		    
		    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
		    	e.preventDefault();
		    }
		}

