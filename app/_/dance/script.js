$(document).ready(function() {
	$.material.init();

	qtipInit();

	// Apply dark theme if previously set.
	$('body').toggleClass('dark', localStorageLoad('dark'));

	keepQRCodeAboveAddressLink();

	$('body').on('click', '.scrollToTop, .feedbackBtn, .themeBtn, .noJumpOnClick, .flip-clock-wrapper [href]', function(e) {
		e.preventDefault();
	});

	$(".container").fadeIn(2000, function() {
		$(".content").css('visibility', 'visible').hide().fadeIn(2000, function() {
			$("#emailAddress").focus();
		});
	});

	$("#contact").on("submit", function(e) {
		e.preventDefault();
		$.ajax({
			url: 'home/submit',
			method: 'POST',
			data: {
				email: $("#emailAddress").val()
			}
		}).done(function(msg) {
			var response = JSON.parse(msg);
			if (response.success) {
				$(".content").fadeOut(500, function() {
					$(this).css('visibility', 'hidden').show();
					$("#alert").css('visibility', 'visible').hide().fadeIn(500);
				});
			}
		});
	});

	$('#qrCodeText').on('mouseover', function(e) {
		keepQRCodeAboveAddressLink();
		$('#qrCode').css('visibility', 'visible').hide().fadeIn('fast');
	});

	$('#qrCodeText').on('mouseleave', function(e) {
		$('#qrCode').css('visibility', 'invisible').fadeOut('fast');
	});

	$(window).on('scroll', function() {
		if ($(this).scrollTop() > 800) {
			$('.scrollToTop').fadeIn();
		} else {
			$('.scrollToTop').fadeOut();
		}
	});

	$('.scrollToTop').on('click', function() {
		$('html, body').animate({ scrollTop: 0 }, "slow");
	});

	$('.feedbackSubmitBtn').on('click', function(e) {
		$this = $(this);
		e.preventDefault();

		if (!isFormValid($this.closest('.modal').attr('id'))) {
			triggerErrorNotification();
			return;
		}

		$this.closest('.modal').modal('hide');

		$.ajax({
			url: '/home/submit',
			method: 'POST',
			data: $('#' + $this.data('form')).serialize()
		}).done(function(response) {
			triggerSuccessNotification();
			resetFormFields();
		});
	});

	$('#feedbackModal').on('shown.bs.modal', function() {
		$('#feedback').focus();
	});

	$('.themeBtn').on('click', function() {
		toggleTheme();
	});

	$(function(){
	    $("[data-hide]").on("click", function() {
	        $(this).closest("." + $(this).attr("data-hide")).hide();
	    });
	});

	$('.modal-tall .modal-body').css('max-height', $( window ).height() - 175);
	$(window).on('resize', function() {
		$('.modal-tall .modal-body').css('max-height', $( window ).height() - 175);
	});
});

function formatNumber(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function triggerSuccessNotification(text) {
	// These class toggles allow us to support both custom and default alert messages.
	$('.alert-notification.alert-success .default-alert-text').toggleClass('hidden', text != undefined);
	$('.alert-notification.alert-success .custom-alert-text').toggleClass('hidden', text == undefined).text(text);

	$('.alert-notification.alert-success').fadeIn();
	setTimeout(function() {
		$('.alert-notification.alert-success').fadeOut(function() {
			$('.alert-notification.alert-success .custom-alert-text').addClass('hidden').empty();
			$('.alert-notification.alert-success .default-alert-text').removeClass('hidden');
		});
	}, 5000);
}

function triggerErrorNotification(text) {
	// These class toggles allow us to support both custom and default alert messages.
	$('.alert-notification.alert-danger .default-alert-text').toggleClass('hidden', text != undefined);
	$('.alert-notification.alert-danger .custom-alert-text').toggleClass('hidden', text == undefined).text(text);

	$('.alert-notification.alert-danger').fadeIn();
	setTimeout(function() {
		$('.alert-notification.alert-danger').fadeOut(function() {
			$('.alert-notification.alert-danger .custom-alert-text').addClass('hidden').empty();
			$('.alert-notification.alert-danger .default-alert-text').removeClass('hidden');
		});
	}, 5000);
}

function triggerWarningNotification(text) {
	// These class toggles allow us to support both custom and default alert messages.
	$('.alert-notification.alert-warning .default-alert-text').toggleClass('hidden', text != undefined);
	$('.alert-notification.alert-warning .custom-alert-text').toggleClass('hidden', text == undefined).text(text);

	$('.alert-notification.alert-warning').fadeIn();
	setTimeout(function() {
		$('.alert-notification.alert-warning').fadeOut(function() {
			$('.alert-notification.alert-warning .custom-alert-text').addClass('hidden').empty();
			$('.alert-notification.alert-warning .default-alert-text').removeClass('hidden');
		});
	}, 10000);
}

function resetFormFields(formIdentifier) {
	formIdentifier = typeof formIdentifier !== 'undefined' ? formIdentifier : 'body';

	$(formIdentifier).find('input, textarea, select, .has-error').each(function() {
		var ignoreList = ['action'];
		if (ignoreList.indexOf($(this).attr('name')) > -1) {
			return true;
		}
		$(this).removeClass('has-error').val('');
	});
}

function isFormValid(modalId) {
	var isValid = true;
	var formHasBeenUpdated = false;
	var fieldElements = '#' + modalId + ' input:not([type=hidden], .multiselect-container [type=checkbox]), #' + modalId + ' select, #' + modalId + ' textarea';
	$(fieldElements).each(function() {
		// Required and matching fields.
		if ($(this).prop('required') && $(this).val() == '' || ($(this).attr('data-match') && $(this).val() !== $('#' + $(this).data('match')).val())) {
			$(this).closest('.form-group').addClass('has-error');
			isValid = false;
		} else {
			$(this).closest('.form-group').removeClass('has-error');
		}

		if ($(this).val() != $(this).data('curval') && $(this).data('curval') !== null || ($(this).val() && !$(this).data('curval'))) {
			formHasBeenUpdated = true;
		}
	});

	if (!formHasBeenUpdated) {
		isValid = false;
		$('#' + modalId + ' .form-group.has-error .form-control').first().focus();
	}

	return isValid;
}

function keepQRCodeAboveAddressLink() {
	$('#qrCode').show();
	while (collision($('#qrCodeText'), $('#qrCode'))) {
		$('#qrCode').css('bottom', parseInt($('#qrCode').css('bottom')) + 25);
	}
}

function collision($div1, $div2) {
	var x1 = $div1.offset().left;
	var y1 = $div1.offset().top;
	var h1 = $div1.outerHeight(true);
	var w1 = $div1.outerWidth(true);
	var b1 = y1 + h1;
	var r1 = x1 + w1;
	var x2 = $div2.offset().left;
	var y2 = $div2.offset().top;
	var h2 = $div2.outerHeight(true);
	var w2 = $div2.outerWidth(true);
	var b2 = y2 + h2;
	var r2 = x2 + w2;

	if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
	return true;
}

function toggleTheme() {
	var dark = !localStorageLoad('dark');

	$('body').toggleClass('dark', dark);

	localStorageSave('dark', dark);
}

function qtipInit() {
	// 'Rich Text Area' refers to TinyMCE.
	$('[title!=""]').not('[title="Rich Text Area. Press ALT-F9 for menu. Press ALT-F10 for toolbar. Press ALT-0 for help"]').qtip({
		overwrite: false,
		prerender: false,
		style: { classes: 'qtip-bootstrap' },
		delay: 0,
		position: { viewport: $(window) }
	});
}

function resetGifAnimation(img) {
	var src = img.attr('src');
	img.removeAttr('src', '');
	img.attr('src', src);
}