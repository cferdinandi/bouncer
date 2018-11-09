/*!
 * Universal Module Definition (UMD) with Constructor Boilerplate
 * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
 */
 (function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define([], function () {
			return factory(root);
		});
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.Bouncer = factory(root);
	}
 })(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function (window) {

	'use strict';

	//
	// Variables
	//

	var defaults = {

		// Classes & IDs
		fieldClass: 'error',
		errorClass: 'error-message',
		fieldPrefix: 'bouncer-field_',
		errorPrefix: 'bouncer-error_',

		// Patterns
		patterns: {
			email: /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*(\.\w{2,})+$/,
			url: /^(?:(?:https?|HTTPS?|ftp|FTP):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/,
			number: /[-+]?[0-9]*[.,]?[0-9]+/,
			color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
			date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))/,
			time: /(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9])/,
			month: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2]))/
		},

		// Messages
		messageAfterField: true,
		messageCustom: 'data-bouncer-message',
		messages: {
			missingValue: {
				checkbox: 'This field is required.',
				radio: 'Please select a value.',
				select: 'Please select a value.',
				'select-multiple': 'Please select at least one value.',
				default: 'Please fill out this field.'
			},
			patternMismatch: {
				email: 'Please enter a valid email address.',
				url: 'Please enter a URL.',
				number: 'Please enter a number',
				color: 'Please match the following format: #rrggbb',
				date: 'Please use the YYYY-MM-DD format',
				time: 'Please use the 24-hour time format. Ex. 23:00',
				month: 'Please use the YYYY-MM format',
				default: 'Please match the requested format.'
			},
			outOfRange: {
				over: 'Please select a value that is no more than {max}.',
				under: 'Please select a value that is no less than {min}.'
			},
			wrongLength: {
				over: 'Please shorten this text to no more than {maxLength} characters. You are currently using {length} characters.',
				under: 'Please lengthen this text to {minLength} characters or more. You are currently using {length} characters.'
			}
		},

		// Form Submission
		disableSubmit: false,

		// Custom Events
		emitEvents: true

	};


	//
	// Methods
	//

	/**
	 * A wrapper for Array.prototype.forEach() for non-arrays
	 * @param  {Array-like} arr      The array-like object
	 * @param  {Function}   callback The callback to run
	 */
	var forEach = function (arr, callback) {
		Array.prototype.forEach.call(arr, callback);
	};

	/**
	 * Merge two or more objects together.
	 * @param   {Object}   objects  The objects to merge together
	 * @returns {Object}            Merged values of defaults and options
	 */
	var extend = function () {
		var merged = {};
		forEach(arguments, function (obj) {
			for (var key in obj) {
				if (!obj.hasOwnProperty(key)) return;
				if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
					merged[key] = extend(merged[key], obj[key]);
				} else {
					merged[key] = obj[key];
				}
				// merged[key] = obj[key];
			}
		});
		return merged;
	};

	/**
	 * Emit a custom event
	 * @param  {String} type    The event type
	 * @param  {Object} options The settings object
	 * @param  {Node}   anchor  The anchor element
	 * @param  {Node}   toggle  The toggle element
	 */
	var emitEvent = function (elem, type, details) {
		if (typeof window.CustomEvent !== 'function') return;
		var event = new CustomEvent(type, {
			bubbles: true,
			detail: details || {}
		});
		elem.dispatchEvent(event);
	};

	/**
	 * Add the `novalidate` attribute to all forms
	 * @param {Boolean} remove  If true, remove the `novalidate` attribute
	 */
	var addNoValidate = function (selector) {
		forEach(document.querySelectorAll(selector), function (form) {
			form.setAttribute('novalidate', true);
		});
	};

	/**
	 * Remove the `novalidate` attribute to all forms
	 */
	var removeNoValidate = function (selector) {
		forEach(document.querySelectorAll(selector), function (form) {
			form.removeAttribute('novalidate');
		});
	};

	/**
	 * Check if a required field is missing its value
	 * @param  {Node} field The field to check
	 * @return {Boolean}       It true, field is missing it's value
	 */
	var missingValue = function (field) {

		// If not required, bail
		if (!field.hasAttribute('required')) return false;

		// Handle checkboxes
		if (field.type === 'checkbox') {
			return !field.checked;
		}

		// Get the field value length
		var length = field.value.length;

		// Handle radio buttons
		if (field.type === 'radio') {
			length = Array.prototype.filter.call(field.form.querySelectorAll('[name="' + field.name + '"]'), function (btn) {
				return btn.checked;
			}).length;
		}

		// Check for value
		return length < 1;

	};

	/**
	 * Check if field value doesn't match a patter.
	 * @param  {Node}   field    The field to check
	 * @param  {Object} settings The plugin settings
	 * @return {Boolean}         If true, there's a pattern mismatch
	 */
	var patternMismatch = function (field, settings) {

		// Check if there's a pattern to match
		var pattern = field.getAttribute('pattern') || settings.patterns[field.type];
		if (!pattern) return false;

		// Validate the pattern
		return !(new RegExp(pattern).test(field.value));

	};

	var outOfRange = function (field) {

		// Check for range
		var max = field.getAttribute('max');
		var min = field.getAttribute('min');

		// Check validity
		var num = parseFloat(field.value);
		if (max && num > max) return 'over';
		if (min && num < min) return 'under';
		return false;

	};

	var wrongLength = function (field) {

		// Check for min/max length
		var max = field.getAttribute('maxlength');
		var min = field.getAttribute('minlength');

		// Check validity
		var length = field.value.length;
		if (max && length > max) return 'over';
		if (min && length < min) return 'under';
		return false;

	};

	var getErrors = function (field, settings) {

		// Get any errors
		var errors = {
			missingValue: missingValue(field),
			patternMismatch: patternMismatch(field, settings),
			outOfRange: outOfRange(field),
			wrongLength: wrongLength(field)
		};

		return {
			valid: !errors.missingValue && !errors.patternMismatch && !errors.outOfRange && !errors.wrongLength,
			errors: errors
		};

	};

	var getFieldID = function (field, settings, create) {
		var id = field.name || field.id;
		if (!id && create) {
			id = settings.fieldPrefix + Math.floor(Math.random() * 999);
			field.id = id;
		}
		return id;
	};

	var createError = function (field, settings) {

		// Create the error message
		var error = document.createElement('div');
		error.className = settings.errorClass;
		error.id = settings.errorPrefix + getFieldID(field, settings, true);

		// If the field is a radio button, get the last item in the radio group
		if (field.type === 'radio') {
			var group = field.form.querySelectorAll('[name="' + field.name + '"]');
			field = group[group.length - 1];
		}

		// If the field is a checkbox or radio button wrapped in a label, get the label
		if (field.type === 'checkbox' || field.type === 'radio') {
			var label = field.closest('label');
			field = label || field;
		}

		// Inject the error message into the DOM
		field.parentNode.insertBefore(error, settings.messageAfterField ? field.nextSibling : field);

		return error;

	};

	var getErrorMessage = function (field, errors, settings) {

		// Variables
		var custom = field.getAttribute(settings.messageCustom);
		var messages = settings.messages;

		// If there's a custom message, use it
		if (custom) return custom;

		// Missing value error
		if (errors.missingValue) {
			return messages.missingValue[field.type] || messages.missingValue.default;
		}

		// Numbers that are out of range
		if (errors.outOfRange) {
			return messages.outOfRange[errors.outOfRange].replace('{max}', field.getAttribute('max')).replace('{min}', field.getAttribute('min')).replace('{length}', field.value.length);
		}

		// Values that are too long or short
		if (errors.wrongLength) {
			return messages.wrongLength[errors.wrongLength].replace('{maxLength}', field.getAttribute('maxlength')).replace('{minLength}', field.getAttribute('minlength')).replace('{length}', field.value.length);
		}

		// Pattern mismatch error
		if (errors.patternMismatch) {
			return messages.patternMismatch[field.type] || messages.patternMismatch.default;
		}

	};

	var showError = function (field, errors, settings) {

		// Get/create an error message
		var error = field.form.querySelector('#' + settings.errorPrefix + getFieldID(field, settings)) || createError(field, settings);
		var msg = getErrorMessage(field, errors, settings);
		error.textContent = msg;

		// Add an error class to the field
		field.classList.add(settings.fieldClass);

		// Accessibility improvement
		field.setAttribute('aria-describedby', error.id);

		// Emit custom event
		if (settings.emitEvents) {
			emitEvent(field, 'bouncerShowError', {
				errors: errors
			});
		}

	};

	var removeError = function (field, settings) {

		// Get the error message for this field
		var error = field.form.querySelector('#' + settings.errorPrefix + getFieldID(field, settings));
		if (!error) return;

		// Remove the error
		error.parentNode.removeChild(error);

		// Remove error and a11y from the field
		field.classList.remove(settings.fieldClass);
		field.removeAttribute('aria-describedby');

		// Emit custom event
		if (settings.emitEvents) {
			emitEvent(field, 'bouncerRemoveError');
		}

	};

	var removeAllErrors = function (selector, settings) {
		forEach(document.querySelectorAll(selector), function (form) {
			formEach(form.elements, function (field) {
				removeError(field, settings);
			});
		});
	};

	/**
	 * The plugin constructor
	 * @param {String} selector The selector to use for forms to be validated
	 * @param {Object} options  User settings [optional]
	 */
	var Constructor = function (selector, options) {

		//
		// Variables
		//

		var publicAPIs = {};
		var settings;


		//
		// Methods
		//

		publicAPIs.validate = function (field, options) {

			// Don't validate submits, buttons, file and reset inputs, and disabled and readonly fields
			if (field.disabled || field.readOnly || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

			// Local settings
			var _settings = extend(settings, options || {});

			// Check for errors
			var isValid = getErrors(field, _settings);

			// If valid, remove any error messages
			if (isValid.valid) {
				removeError(field, _settings);
				return;
			}

			// Otherwise, show an error message
			showError(field, isValid.errors, _settings);

			return isValid;

		};

		var blurHandler = function (event) {

			// Only run if the field is in a form to be validated
			if (!event.target.form || !event.target.form.matches(selector)) return;

			// Validate the field
			publicAPIs.validate(event.target);

		};

		var inputHandler = function (event) {

			// Only run if the field is in a form to be validated
			if (!event.target.form || !event.target.form.matches(selector)) return;

			// Only run on radio and checkbox inputs
			// if (event.target.type === 'checkbox' || event.target.type === 'radio') return;
			if (!event.target.classList.contains(settings.fieldClass)) return;

			// Validate the field
			publicAPIs.validate(event.target);

		};

		var submitHandler = function (event) {

			// Only run on matching elements
			if (!event.target.matches(selector)) return;

			// Prevent form submission
			event.preventDefault();

			// Validate each field
			var errors = Array.prototype.filter.call(event.target.elements, function (field) {
				var validate = publicAPIs.validate(field);
				return validate && !validate.valid;
			});

			// If there are errors, focus on the first one
			if (errors.length > 0) {
				errors[0].focus();
				return;
			}

			// Otherwise, submit if not disabled
			if (!settings.disableSubmit) {
				event.target.submit();
			}

			// Emit custom event
			if (settings.emitEvents) {
				emitEvent(event.target, 'bouncerFormValid');
			}

		};

		publicAPIs.destroy = function () {

			// Remove event listeners
			document.removeEventListener('blur', blurHandler, true);
			document.removeEventListener('input', inputHandler, false);
			document.removeEventListener('submit', submitHandler, false);

			// Remove all errors
			removeAllErrors(selector, settings);

			// Remove novalidate attribute
			removeNoValidate(selector);

			// Emit custom event
			if (settings.emitEvents) {
				emitEvent(document, 'bouncerDestroyed', {
					settings: settings
				});
			}

			// Reset settings
			settings = null;

		};

		var init = function () {

			// Create settings
			settings = extend(defaults, options || {});

			// Add novalidate attribute
			addNoValidate(selector);

			// Event Listeners
			document.addEventListener('blur', blurHandler, true);
			document.addEventListener('input', inputHandler, false);
			document.addEventListener('submit', submitHandler, false);

			// Emit custom event
			if (settings.emitEvents) {
				emitEvent(document, 'bouncerInitialized', {
					settings: settings
				});
			}

		};

		//
		// Inits & Event Listeners
		//

		init();
		return publicAPIs;

	};


	//
	// Return the constructor
	//

	return Constructor;

});