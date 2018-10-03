var varsPagina = validarAccesoURL(); 
var arrPagina = varsPagina.split('~');

if (varsPagina[0]!='0') {
	iniciarMenu(); 
	var urlTmp = window.location.href.split("?");
	
	$.ajax({
		type: "POST",
		url: sessionStorage.getItem("ssnURLEndpoint")+arrPagina[1]+'?'+urlTmp[1],
		success: function(response)
		{
			console.log(response);
			var objetos = JSON.parse(response);	
			for (i = 0; i < Object.keys(objetos.secciones).length; i++) {
				$('#'+objetos.secciones[i].objeto).html(objetos.secciones[i].contenido); 
			} 
			
			var ubcActual=window.location.href.replace(sessionStorage.getItem("ssnURLContexto"), ''); 
			var arrActual=ubcActual.split('?');
			
			switch(arrActual[0]){
				case 'mapa/inicio/':
					$('#divTitulo').html('<h3>'+objetos.pagina+'</h3>');
				break; 
				default:
					document.title = 'ecomercia | '+objetos.pagina;
					$('#divTitulo').html('<h3>'+objetos.pagina+'</h3>');
					$('#divSubTitulo').html('<h2>Listado de '+objetos.pagina+'<small> Tablero de control de '+objetos.pagina+' del sistema</small></h2><div class="clearfix"></div>');
					$('#pDescripcion').html('A continuaci&oacute;n se listan los &iacute;tems que usted puede administrar.');
					init_DataTables();
				break;
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert("Error detectado: " + textStatus + "nExcepcion: " + errorThrown); 
		} 
	});
} else {
	console.log('Esta tomando el camino correcto.');
	sessionStorage.clear();
	window.open('../login/','_self');
}

function validarAccesoURL() { 
	var arrVlrsPagina = '0~';
	if (sessionStorage.getItem('ssnSeguridad')!==null) {
		var mnu = JSON.parse(sessionStorage.getItem('ssnSeguridad'));
		for (i = 0; i < Object.keys(mnu.menu).length; i++) {
			if (mnu.menu[i].idpadre>=0) {			
				var urlTmp = window.location.href.split("?");
				if (window.location.href == sessionStorage.getItem("ssnURLContexto") + mnu.menu[i].url.replace("..", "mapa")) {
					var arrVlrsPagina = "1~"+mnu.menu[i].endpoint;
					return arrVlrsPagina;
					break;
				}
			}
		}
	}
	return arrVlrsPagina; 
}

function iniciarMenu() {
	if (sessionStorage.getItem('ssnSeguridad')!==null) {
		var mnu = JSON.parse(sessionStorage.getItem('ssnSeguridad'));
		estadoLi = 0; 
		var li = '';
		i = 0;
		
		for (i = 0; i < Object.keys(mnu.menu).length; i++) {
			if (mnu.menu[i].idpadre != '') {						//Se ignoran las páginas que no tengan padre en el menú
				if (mnu.menu[i].idpadre < 0) {				
					if (estadoLi) {							
						li+= "</ul>";
						li+= "</li>";
						estadoLi = 0;
					}
					li+= "<li><a><i class='fa fa-" + mnu.menu[i].icono + "'></i> "+ mnu.menu[i].nombre +" <span class='fa fa-chevron-down'></span></a>";
					li+= '<ul class="nav child_menu">';
					estadoLi = 1;
				} else {
					li+= '<li><a href="'+ mnu.menu[i].url +'">'+ mnu.menu[i].nombre +'</a></li>';
				}		
			}
		}
		li+= "</ul></li>";
		$('#menu').html(li);
	}
}

function showDiv(funcionalidad,nombreDiv) {
	switch(funcionalidad) {
		case 'productos':
			$("#basico-t").hide(); $("#inventario-t").hide(); $("#composicion-t").hide(); 
		break;
	}
	$("#"+nombreDiv).fadeToggle();
}
		
function asignarValores(vlrActual,controles){
	var vlr = vlrActual.split("~");	var ctr = controles.split("~");
	document.getElementById(ctr[0]).value=vlr[0];
	document.getElementById(ctr[1]).value=vlr[1];	
	$('#'+ctr[2]).val(vlr[2]);
}

function validarFrm(nombreDiv) {
	switch(nombreDiv) {
	case "divSegAdmCreObj":
		$('#frmCreObj').validate({
				ignore: ".ignore",
				rules: {
							txtNombre: { required: true, minlength: 4, maxlength: 40},
							txtDescripcion: { required: true, minlength: 4, maxlength: 250},
							mnuEstado: { required: true },
							mnuVisualizacion: { required: true },
							mnuInterface: { required: true },
							txtContenido: { required: true, minlength: 4, maxlength: 2000 }
						},
				messages: {
							txtNombre: "Escriba la identificaci&oacute;n del objeto (div).",
							txtDescripcion : "Describa el objetivo del objeto (div), m&aacute;ximo 250 car.", 
							mnuEstado : "Elija el estado del objeto.", 
							mnuVisualizacion: "Seleccione el modo de visualizaci&oacute;n.", 
							mnuInterface : "Asocie una interface a este objeto (div).", 
							txtContenido : "Escriba el valor t&eacute;cnico del objeto, sea HTML o funci&oacute;n."
						},
				invalidHandler: function (event, validator) { //display error alert on form submit
					var errors = validator.numberOfInvalids();
					if (errors) {							
						$("#divValidacionExt").hide();
						$("#divValidacionErr").show();
					}
				},
				highlight: function (element) {
					$(element).closest('.help-block').removeClass('valid');
					// display OK icon
					$(element).closest('.form-group').removeClass('has-success').addClass('has-error').find('.symbol').removeClass('ok').addClass('required');
					// add the Bootstrap error class to the control group
				},
				unhighlight: function (element) { // revert the change done by hightlight
					$(element).closest('.form-group').removeClass('has-error');
					// set error class to the control group
				},
				success: function (label, element) {
					label.addClass('help-block valid');
					// mark the current input as valid and display OK icon
					$(element).closest('.form-group').removeClass('has-error').addClass('has-success').find('.symbol').removeClass('required').addClass('ok');
				},
				submitHandler: function(form) {
					$("#divValidacionErr").hide();
					$("#divValidacionInf").show();
					var fd = new FormData ($('#frmCreObj')[0]);
					
					$.ajax({
						url: '../ajax/seguridad.obj.divAdmCreObj.php', 
						type: 'POST',  
						data: fd,
						cache: false,             
						contentType: false,
						processData: false, 
						success: function(data) { 
							var seg = JSON.parse(data);
							if (seg.estado==1) {
								new PNotify({
									  title: 'Transacci&oacute;n Exitosa',
									  text: seg.mensaje,
									  type: 'success',
									  styling: 'bootstrap3'
								  });
							} else {
								new PNotify({
									  title: 'Error en Transaccio&oacute;n',
									  text: seg.mensaje,
									  type: 'error',
									  styling: 'bootstrap3'
								  });
							}
							setInterval("window.open('../seguridad/objetos.html','_self')", 4000);
						},
						error: function(jqXHR, textStatus, errorThrown) {
							alert("Error detectado: " + textStatus + "nExcepcion: " + errorThrown);
						}
					});
					return false;
				}
		});
	break;
	
	}
}

function calcularEvaluacionas(control,valor) {
	var resultado = 0; var i; var tmpPuntuacion = 0;
	tmpPuntuacion = valor * $('#hdnPonderacion_'+control).val();
	$('#divPuntuacionPreg_'+control).html(tmpPuntuacion.toFixed(1));
	for (i = 1; i < $('#hdnNumPreguntas').val(); i++) { 
		resultado = resultado + $('#divPuntuacionPreg_'+control).val();
		alert('valor resultado='+resultado);
	}
	alert('valor final resultado='+resultado);
	$('#divPuntuacionTotal').html(resultado.toFixed(1));
}

function habDesDivs(control){
	if ($('#'+control).is(':checked')) {
		$("#divComercial").show();
	} else {
		$("#divComercial").hide();
	}
}

function obtParamURL(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function mskFld(campos){
	var campo = campos.split("~"); var i;
	for (i = 0; i < campo.length; i++) {
		$("#"+campo[i]).maskMoney({
		  // The symbol to be displayed before the value entered by the user
		  prefix:'$ ',
		  // The suffix to be displayed after the value entered by the user(example: "1234.23 €").
		  suffix: "",
		  // Delay formatting of text field until focus leaves the field
		  formatOnBlur: false,
		  // Prevent users from inputing zero
		  allowZero:true,
		  // Prevent users from inputing negative values
		  allowNegative:false,
		  // Allow empty input values, so that when you delete the number it doesn't reset to 0.00.
		  allowEmpty: false,
		  // Select text in the input on double click
		  doubleClickSelection: true,
		  // Select all text in the input when the element fires the focus event.
		  selectAllOnFocus: true,
		  // The thousands separator
		  thousands: ',',
		  // The decimal separator
		  decimal: '.' ,
		  // How many decimal places are allowed
		  precision: 2,
		  // Set if the symbol will stay in the field after the user exits the field.
		  affixesStay : false,
		  // Place caret at the end of the input on focus
		  bringCaretAtEndOnFocus: true
		});
	}
}

//Maestro: Productos
function enviarFrmActItem(nomFormulario) {
	$('#divValidacionErr').hide(); $('#divValidacionExt').hide(); 				
	var fd = new FormData ($('#'+nomFormulario)[0]);
	var vblURL = ''; var urlTmp = window.location.href.split('?');
	
	switch(nomFormulario){
		case 'frmInfBsc':	vblURL = 'frm='+btoa(nomFormulario)+'&tbl='+btoa('divCntObjDet')+'&acc='+btoa('CRE')+'&tip='+btoa('MST')+'&ide='+btoa($('#'+nomFormulario+'_codItem').val())+'&';		break; 
		case 'frmInfInv':	vblURL = 'frm='+btoa(nomFormulario)+'&tbl='+btoa('divCntObjDet')+'&acc='+btoa('UPD')+'&tip='+btoa('INV')+'&ide='+btoa($('#'+nomFormulario+'_codItem').val())+'&';		break; 
		case 'frmInfCmp':	vblURL = 'frm='+btoa(nomFormulario)+'&tbl='+btoa('divCntObjDet')+'&acc='+btoa('UPD')+'&tip='+btoa('CMP')+'&ide='+btoa($('#'+nomFormulario+'_codItem').val())+'&';		break; 
	}
	
	$.ajax({
		url: sessionStorage.getItem('ssnURLEndpoint')+'maestros.productos.adm.gb.php?'+vblURL+urlTmp[1], 
		type: 'POST',  
		data: fd,
		cache: false,             
		contentType: false,
		processData: false, 
		success: function(data) { 
			//alert(data);
			var seg = JSON.parse(data);													
			if (seg.estado=='1') { 
				document.getElementById('divValidacionExt').innerHTML='<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button><i class=\"fa fa-ok\"></i>'+seg.mensaje;
				$('#divValidacionExt').show();														
				
				//Actualizar códigos por cada formulario y mostrar las secciones ahora que tenemos el código 
				if (nomFormulario=='frmInfBsc') { 
					$('#frmInfBsc_codItem').val(seg.codigo); $('#frmInfInv_codItem').val(seg.codigo); $('#frmInfCmp_codItem').val(seg.codigo); 
					$('#liInventario').show(); $('#liComposicion').show();
				}
				$('#'+seg.objeto).html(seg.contenido); 
				$('#datatable-'+nomFormulario).dataTable();
				
			} else {
				document.getElementById('divValidacionErr').innerHTML='<i class=\"fa fa-times-sign\"></i>'+seg.mensaje;
				$('#divValidacionErr').show();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('Error detectado: ' + textStatus + ', nExcepcion: ' + errorThrown);
		}
	});
}

function admProducto(codigo) { 
	var urlTmp = window.location.href.split('?'); var tmpCod=0;	if ( codigo=== undefined) { tmpCod=btoa(0); } else { tmpCod=codigo; }
	$.ajax({
		url: sessionStorage.getItem('ssnURLEndpoint')+'maestros.productos.adm.cp.php?acc='+btoa('NUE')+'&tip='+btoa('MST')+'&ide='+tmpCod+'&'+urlTmp[1], 
		type: 'POST',  
		cache: false,             
		contentType: false,
		processData: false, 
		success: function(data) { 
			console.log(data);
			var objetos = JSON.parse(data);	
			for (i = 0; i < Object.keys(objetos).length; i++) {
				$('#'+objetos[i].objeto).html(objetos[i].contenido); 
			} 
			$('#datatable-').dataTable();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('Error detectado: ' + textStatus + ' Excepcion: ' + errorThrown);
		}
	}); 
	
	$('#mdlCntObjEnc').modal('toggle');
	$('#mdlCntObjEnc').modal('show');
}

function crgSubPanel(nomFormulario,producto){
	var fd = new FormData ($('#'+nomFormulario)[0]);
	var vblURL = ''; var urlTmp = window.location.href.split('?');
	
	switch(nomFormulario){
		case 'frmInfInv':	vblURL = 'frm='+btoa(nomFormulario)+'&tbl='+btoa('tblInventario')+'&acc='+btoa('CNS')+'&tip='+btoa('INV')+'&ide='+btoa(producto)+'&';		break; 
		case 'frmInfCmp':	vblURL = 'frm='+btoa(nomFormulario)+'&tbl='+btoa('tblComposicion')+'&acc='+btoa('CNS')+'&tip='+btoa('CMP')+'&ide='+btoa(producto)+'&';		break; 
		case 'frmInfPed':	vblURL = 'frm='+btoa(nomFormulario)+'&tbl='+btoa('tblPediDetalle')+'&acc='+btoa('CNS')+'&tip='+btoa('CMP')+'&ide='+btoa(producto)+'&';		break; 
	}
	
	$.ajax({
		url: sessionStorage.getItem('ssnURLEndpoint')+'maestros.productos.adm.gb.php?'+vblURL+urlTmp[1], 
		type: 'POST',  
		data: fd,
		cache: false,             
		contentType: false,
		processData: false, 
		success: function(data) { 
			console.log('P A N E L='+data);
			var seg = JSON.parse(data);													
			$('#'+seg.objeto).html(seg.contenido); 
			$('#datatable-'+nomFormulario).dataTable();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('Error detectado: ' + textStatus + ', nExcepcion: ' + errorThrown);
		}
	});
}

function elmProducto(nomFormulario,producto,producto_padre){
	var vblURL = ''; var urlTmp = window.location.href.split('?');
	
	switch(nomFormulario){
		case 'frmInfInv':	vblURL = 'frm='+btoa(nomFormulario)+'&tbl='+btoa('tblInventario')+'&acc='+btoa('ELM')+'&tip='+btoa('INV')+'&ide='+btoa(producto)+'&';									break; 
		case 'frmInfCmp':	vblURL = 'frm='+btoa(nomFormulario)+'&tbl='+btoa('tblComposicion')+'&acc='+btoa('ELM')+'&tip='+btoa('CMP')+'&ide='+producto+'&ppadre='+producto_padre+'&';		break; 
	}
	
	$.ajax({
		url: sessionStorage.getItem('ssnURLEndpoint')+'maestros.productos.adm.gb.php?'+vblURL+urlTmp[1], 
		type: 'POST',  
		cache: false,             
		contentType: false,
		processData: false, 
		success: function(data) { 
			console.log('E L I M I N A R ='+data);
			var seg = JSON.parse(data);													
			if (seg.estado=='1') { 
				document.getElementById('divValidacionExt').innerHTML='<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button><i class=\"fa fa-ok\"></i>'+seg.mensaje;
				$('#divValidacionExt').show();														
				$('#'+seg.objeto).html(seg.contenido); 
				$('#datatable-'+nomFormulario).dataTable();
			} else {
				document.getElementById('divValidacionErr').innerHTML='<i class=\"fa fa-times-sign\"></i>'+seg.mensaje;
				$('#divValidacionErr').show();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('Error detectado: ' + textStatus + ', nExcepcion: ' + errorThrown);
		}
	});
}

function edtProducto(codigo) { 
	var urlTmp = window.location.href.split('?');
	$.ajax({
		url: sessionStorage.getItem('ssnURLEndpoint')+'maestros.productos.adm.cp.php?acc='+btoa('ACT')+'&tip='+btoa('MST')+'&ide='+codigo+'&'+urlTmp[1], 
		type: 'POST',  
		cache: false,             
		contentType: false,
		processData: false, 
		success: function(data) { 
			var objetos = JSON.parse(data);	
			for (i = 0; i < Object.keys(objetos).length; i++) {
				$('#'+objetos[i].objeto).html(objetos[i].contenido); 
			} 
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('Error detectado: ' + textStatus + ' Excepcion: ' + errorThrown);
		}
	}); 
	$('#mdlCntObjEnc').modal('toggle');
	$('#mdlCntObjEnc').modal('show');
} 


//Maestro: Terceros
function admTercero(codigo) { 
	var urlTmp = window.location.href.split('?'); var tmpCod=0;	if ( codigo=== undefined) { tmpCod=btoa(0); } else { tmpCod=codigo; }
	$.ajax({
		url: sessionStorage.getItem('ssnURLEndpoint')+'maestros.terceros.adm.cp.php?acc='+btoa('NUE')+'&tip='+btoa('MST')+'&ide='+tmpCod+'&'+urlTmp[1], 
		type: 'POST',  
		cache: false,             
		contentType: false,
		processData: false, 
		success: function(data) { 
			console.log(data);
			var objetos = JSON.parse(data);	
			for (i = 0; i < Object.keys(objetos).length; i++) {
				$('#'+objetos[i].objeto).html(objetos[i].contenido); 
			} 
			$('#datatable-').dataTable();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('Error detectado: ' + textStatus + ' Excepcion: ' + errorThrown);
		}
	}); 
	
	$('#mdlCntObjEnc').modal('toggle');
	$('#mdlCntObjEnc').modal('show');
}

function enviarFrmActItemTrc(nomFormulario) {
	$('#divValidacionErr').hide(); $('#divValidacionExt').hide(); 				
	var fd = new FormData ($('#'+nomFormulario)[0]);
	var urlTmp = window.location.href.split('?');
	var vblURL = 'frm='+btoa(nomFormulario)+'&tbl='+btoa('divCntObjDet')+'&acc='+btoa('CRE')+'&tip='+btoa('MST')+'&ide='+btoa($('#'+nomFormulario+'_codItem').val())+'&';
	
	$.ajax({
		url: sessionStorage.getItem('ssnURLEndpoint')+'maestros.terceros.adm.gb.php?'+vblURL+urlTmp[1], 
		type: 'POST',  
		data: fd,
		cache: false,             
		contentType: false,
		processData: false, 
		success: function(data) { 
			console.log('A D M.  T E R C E R O ='+data);
			var seg = JSON.parse(data);													
			if (seg.estado=='1') { 
				document.getElementById('divValidacionExt').innerHTML='<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button><i class=\"fa fa-ok\"></i>'+seg.mensaje;
				$('#divValidacionExt').show();	
				$('#frmInfBsc_codItem').val(seg.codigo);				
				$('#'+seg.objeto).html(seg.contenido); 
				init_DataTables();				
			} else {
				document.getElementById('divValidacionErr').innerHTML='<i class=\"fa fa-times-sign\"></i>'+seg.mensaje;
				$('#divValidacionErr').show();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('Error detectado: ' + textStatus + ', nExcepcion: ' + errorThrown);
		}
	});
}


//Maestro: Categorias
function admCategoria(codigo) { 
	var urlTmp = window.location.href.split('?'); var tmpCod=0;	if ( codigo=== undefined) { tmpCod=btoa(0); } else { tmpCod=codigo; }
	$.ajax({
		url: sessionStorage.getItem('ssnURLEndpoint')+'maestros.categorias.adm.cp.php?acc='+btoa('NUE')+'&tip='+btoa('MST')+'&ide='+tmpCod+'&'+urlTmp[1], 
		type: 'POST',  
		cache: false,             
		contentType: false,
		processData: false, 
		success: function(data) { 
			console.log(data);
			var objetos = JSON.parse(data);	
			for (i = 0; i < Object.keys(objetos).length; i++) {
				$('#'+objetos[i].objeto).html(objetos[i].contenido); 
			} 
			$('#datatable-').dataTable();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('Error detectado: ' + textStatus + ' Excepcion: ' + errorThrown);
		}
	}); 
	
	$('#mdlCntObjEnc').modal('toggle');
	$('#mdlCntObjEnc').modal('show');
}

function enviarFrmActItemCat(nomFormulario) {
	$('#divValidacionErr').hide(); $('#divValidacionExt').hide(); 				
	var fd = new FormData ($('#'+nomFormulario)[0]);
	var urlTmp = window.location.href.split('?');
	var vblURL = 'frm='+btoa(nomFormulario)+'&tbl='+btoa('divCntObjDet')+'&acc='+btoa('CRE')+'&tip='+btoa('MST')+'&ide='+btoa($('#'+nomFormulario+'_codItem').val())+'&';
	
	$.ajax({
		url: sessionStorage.getItem('ssnURLEndpoint')+'maestros.categorias.adm.gb.php?'+vblURL+urlTmp[1], 
		type: 'POST',  
		data: fd,
		cache: false,             
		contentType: false,
		processData: false, 
		success: function(data) { 
			console.log('A D M.  C A T E G O R I A ='+data);
			var seg = JSON.parse(data);													
			if (seg.estado=='1') { 
				document.getElementById('divValidacionExt').innerHTML='<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button><i class=\"fa fa-ok\"></i>'+seg.mensaje;
				$('#divValidacionExt').show();	
				$('#frmInfBsc_codItem').val(seg.codigo);				
				$('#'+seg.objeto).html(seg.contenido); 
				init_DataTables();				
			} else {
				document.getElementById('divValidacionErr').innerHTML='<i class=\"fa fa-times-sign\"></i>'+seg.mensaje;
				$('#divValidacionErr').show();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('Error detectado: ' + textStatus + ', nExcepcion: ' + errorThrown);
		}
	});
}


//Operacion: Pedidos
function admPedido(codigo) { 
	var urlTmp = window.location.href.split('?'); var tmpCod=0;	if ( codigo=== undefined) { tmpCod=btoa(0); } else { tmpCod=codigo; }
	$.ajax({
		url: sessionStorage.getItem('ssnURLEndpoint')+'operacion.pedidos.adm.cp.php?acc='+btoa('NUE')+'&tip='+btoa('MST')+'&ide='+tmpCod+'&'+urlTmp[1], 
		type: 'POST',  
		cache: false,             
		contentType: false,
		processData: false, 
		success: function(data) { 
			console.log(data);
			var objetos = JSON.parse(data);	
			for (i = 0; i < Object.keys(objetos).length; i++) {
				$('#'+objetos[i].objeto).html(objetos[i].contenido); 
			} 
			$('#datatable-').dataTable();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('Error detectado: ' + textStatus + ' Excepcion: ' + errorThrown);
		}
	}); 
}

function enviarFrmActItemCat(nomFormulario) {
	$('#divValidacionErr').hide(); $('#divValidacionExt').hide(); 				
	var fd = new FormData ($('#'+nomFormulario)[0]);
	var urlTmp = window.location.href.split('?');
	var vblURL = 'frm='+btoa(nomFormulario)+'&tbl='+btoa('divCntObjDet')+'&acc='+btoa('CRE')+'&tip='+btoa('MST')+'&ide='+btoa($('#'+nomFormulario+'_codItem').val())+'&';
	
	$.ajax({
		url: sessionStorage.getItem('ssnURLEndpoint')+'maestros.categorias.adm.gb.php?'+vblURL+urlTmp[1], 
		type: 'POST',  
		data: fd,
		cache: false,             
		contentType: false,
		processData: false, 
		success: function(data) { 
			console.log('A D M.  C A T E G O R I A ='+data);
			var seg = JSON.parse(data);													
			if (seg.estado=='1') { 
				document.getElementById('divValidacionExt').innerHTML='<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button><i class=\"fa fa-ok\"></i>'+seg.mensaje;
				$('#divValidacionExt').show();	
				$('#frmInfBsc_codItem').val(seg.codigo);				
				$('#'+seg.objeto).html(seg.contenido); 
				init_DataTables();				
			} else {
				document.getElementById('divValidacionErr').innerHTML='<i class=\"fa fa-times-sign\"></i>'+seg.mensaje;
				$('#divValidacionErr').show();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('Error detectado: ' + textStatus + ', nExcepcion: ' + errorThrown);
		}
	});
}

function crgSubPanelPed(nomFormulario,producto){
	var fd = new FormData ($('#'+nomFormulario)[0]);
	var vblURL = ''; var urlTmp = window.location.href.split('?');
	
	switch(nomFormulario){
		case 'frmInfPed':	vblURL = 'frm='+btoa(nomFormulario)+'&tbl='+btoa('tblPediDetalle')+'&acc='+btoa('CRT')+'&tip='+btoa('DET')+'&ide='+btoa(producto)+'&';		break; 
	}
	
	$.ajax({
		url: sessionStorage.getItem('ssnURLEndpoint')+'maestros.productos.adm.gb.php?'+vblURL+urlTmp[1], 
		type: 'POST',  
		data: fd,
		cache: false,             
		contentType: false,
		processData: false, 
		success: function(data) { 
			console.log('P A N E L='+data);
			var seg = JSON.parse(data);													
			$('#'+seg.objeto).html(seg.contenido); 
			$('#datatable-'+nomFormulario).dataTable();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('Error detectado: ' + textStatus + ', nExcepcion: ' + errorThrown);
		}
	});
}