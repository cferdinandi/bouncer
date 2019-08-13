/*!
 * formbouncerjs v1.4.6
 * A lightweight form validation script that augments native HTML5 form validation elements and attributes.
 * (c) 2019 Chris Ferdinandi
 * MIT License
 * http://github.com/cferdinandi/bouncer
 */

(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define([], (function () {
			return factory(root);
		}));
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.Bouncer = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, (function (window) {

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
			number: /^(?:[-+]?[0-9]*[.,]?[0-9]+)$/,
			color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
			date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))/,
			time: /^(?:(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]))$/,
			month: /^(?:(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])))$/
		},

		// Custom Validations
		customValidations: {},

		// Messages
		messageAfterField: true,
		messageCustom: 'data-bouncer-message',
		messageTarget: 'data-bouncer-target',
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
			},
			fallback: 'There was an error with this field.'
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
		forEach(arguments, (function (obj) {
			for (var key in obj) {
				if (!obj.hasOwnProperty(key)) return;
				if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
					merged[key] = extend(merged[key], obj[key]);
				} else {
					merged[key] = obj[key];
				}
				// merged[key] = obj[key];
			}
		}));
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
		forEach(document.querySelectorAll(selector), (function (form) {
			form.setAttribute('novalidate', true);
		}));
	};

	/**
	 * Remove the `novalidate` attribute to all forms
	 */
	var removeNoValidate = function (selector) {
		forEach(document.querySelectorAll(selector), (function (form) {
			form.removeAttribute('novalidate');
		}));
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
			length = Array.prototype.filter.call(field.form.querySelectorAll('[name="' + escapeCharacters(field.name) + '"]'), (function (btn) {
				return btn.checked;
			})).length;
		}

		// Check for value
		return length < 1;

	};

	/**
	 * Check if field value doesn't match a patter.
	 * @param  {Node}   field    The field to check
	 * @param  {Object} settings The plugin settings
	 * @see https://www.w3.org/TR/html51/sec-forms.html#the-pattern-attribute
	 * @return {Boolean}         If true, there's a pattern mismatch
	 */
	var patternMismatch = function (field, settings) {

		// Check if there's a pattern to match
		var pattern = field.getAttribute('pattern');
		pattern = pattern ? new RegExp('^(?:' + pattern + ')$') : settings.patterns[field.type];
		if (!pattern || !field.value || field.value.length < 1) return false;

		// Validate the pattern
		return field.value.match(pattern) ? false : true;

	};

	/**
	 * Check if field value is out-of-range
	 * @param  {Node}    field    The field to check
	 * @return {String}           Returns 'over', 'under', or false
	 */
	var outOfRange = function (field) {

		// Make sure field has value
		if (!field.value || field.value.length < 1) return false;

		// Check for range
		var max = field.getAttribute('max');
		var min = field.getAttribute('min');

		// Check validity
		var num = parseFloat(field.value);
		if (max && num > max) return 'over';
		if (min && num < min) return 'under';
		return false;

	};

	/**
	 * Check if the field value is too long or too short
	 * @param  {Node}   field    The field to check
	 * @return {String}           Returns 'over', 'under', or false
	 */
	var wrongLength = function (field) {

		// Make sure field has value
		if (!field.value || field.value.length < 1) return false;

		// Check for min/max length
		var max = field.getAttribute('maxlength');
		var min = field.getAttribute('minlength');

		// Check validity
		var length = field.value.length;
		if (max && length > max) return 'over';
		if (min && length < min) return 'under';
		return false;

	};

	/**
	 * Test for standard field validations
	 * @param  {Node}   field    The field to test
	 * @param  {Object} settings The plugin settings
	 * @return {Object}          The tests and their results
	 */
	var runValidations = function (field, settings) {
		return {
			missingValue: missingValue(field),
			patternMismatch: patternMismatch(field, settings),
			outOfRange: outOfRange(field),
			wrongLength: wrongLength(field)
		};
	};

	/**
	 * Run any provided custom validations
	 * @param  {Node}   field       The field to test
	 * @param  {Object} errors      The existing errors
	 * @param  {Object} validations The custom validations to run
	 * @param  {Object} settings    The plugin settings
	 * @return {Object}             The tests and their results
	 */
	var customValidations = function (field, errors, validations, settings) {
		for (var test in validations) {
			if (validations.hasOwnProperty(test)) {
				errors[test] = validations[test](field, settings);
			}
		}
		return errors;
	};

	/**
	 * Check if a field has any errors
	 * @param  {Object}  errors The validation test results
	 * @return {Boolean}        Returns true if there are errors
	 */
	var hasErrors = function (errors) {
		for (var type in errors) {
			if (errors[type]) return true;
		}
		return false;
	};

	/**
	 * Check a field for errors
	 * @param  {Node} field      The field to test
	 * @param  {Object} settings The plugin settings
	 * @return {Object}          The field validity and errors
	 */
	var getErrors = function (field, settings) {

		// Get standard validation errors
		var errors = runValidations(field,settings);

		// Check for custom validations
		errors = customValidations(field, errors, settings.customValidations, settings);

		return {
			valid: !hasErrors(errors),
			errors: errors
		};

	};

	/**
	 * Escape special characters for use with querySelector
	 * @author Mathias Bynens
	 * @link https://github.com/mathiasbynens/CSS.escape
	 * @param {String} id The anchor ID to escape
	 */
	var escapeCharacters = function (id) {

		var string = String(id);
		var length = string.length;
		var index = -1;
		var codeUnit;
		var result = '';
		var firstCodeUnit = string.charCodeAt(0);
		while (++index < length) {
			codeUnit = string.charCodeAt(index);
			// Note: there’s no need to special-case astral symbols, surrogate
			// pairs, or lone surrogates.

			// If the character is NULL (U+0000), then throw an
			// `InvalidCharacterError` exception and terminate these steps.
			if (codeUnit === 0x0000) {
				throw new InvalidCharacterError(
					'Invalid character: the input contains U+0000.'
				);
			}

			if (
				// If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
				// U+007F, […]
				(codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
				// If the character is the first character and is in the range [0-9]
				// (U+0030 to U+0039), […]
				(index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
				// If the character is the second character and is in the range [0-9]
				// (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
				(
					index === 1 &&
					codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
					firstCodeUnit === 0x002D
				)
			) {
				// http://dev.w3.org/csswg/cssom/#escape-a-character-as-code-point
				result += '\\' + codeUnit.toString(16) + ' ';
				continue;
			}

			// If the character is not handled by one of the above rules and is
			// greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
			// is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
			// U+005A), or [a-z] (U+0061 to U+007A), […]
			if (
				codeUnit >= 0x0080 ||
				codeUnit === 0x002D ||
				codeUnit === 0x005F ||
				codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
				codeUnit >= 0x0041 && codeUnit <= 0x005A ||
				codeUnit >= 0x0061 && codeUnit <= 0x007A
			) {
				// the character itself
				result += string.charAt(index);
				continue;
			}

			// Otherwise, the escaped character.
			// http://dev.w3.org/csswg/cssom/#escape-a-character
			result += '\\' + string.charAt(index);

		}

		// Return sanitized hash
		return result;

	};

	/**
	 * Get or create an ID for a field
	 * @param  {Node}    field    The field
	 * @param  {Object}  settings The plugin settings
	 * @param  {Boolean} create   If true, create an ID if there isn't one
	 * @return {String}           The field ID
	 */
	var getFieldID = function (field, settings, create) {
		var id = field.name ? field.name : field.id;
		if (!id && create) {
			id = settings.fieldPrefix + Math.floor(Math.random() * 999);
			field.id = id;
		}
		if (field.type === 'checkbox') {
			id += '_' + (field.value || field.id);
		}
		return id;
	};

	/**
	 * Special handling for radio buttons and checkboxes wrapped in labels.
	 * @param  {Node} field The field with the error
	 * @return {Node}       The field to show the error on
	 */
	var getErrorField = function (field) {

		// If the field is a radio button, get the last item in the radio group
		// @todo if location is before, get first item
		if (field.type === 'radio' && field.name) {
			var group = field.form.querySelectorAll('[name="' + escapeCharacters(field.name) + '"]');
			field = group[group.length - 1];
		}

		// Get the associated label for radio button or checkbox
		if (field.type === 'radio' || field.type === 'checkbox') {
			var label = field.closest('label') || field.form.querySelector('[for="' + field.id + '"]');
			field = label || field;
		}

		return field;

	};

	/**
	 * Get the location for a field's error message
	 * @param  {Node}   field    The field
	 * @param  {Node}   target   The target for error message
	 * @param  {Object} settings The plugin settings
	 * @return {Node}            The error location
	 */
	var getErrorLocation = function (field, target, settings) {

		// Check for a custom error message
		var selector = field.getAttribute(settings.messageTarget);
		if (selector) {
			var location = field.form.querySelector(selector);
			if (location) {
				// @bugfix by @HaroldPutman
				// https://github.com/cferdinandi/bouncer/pull/28
				return location.firstChild || location.appendChild(document.createTextNode(''));
			}
		}

		// If the message should come after the field
		if (settings.messageAfterField) {

			// If there's no next sibling, create one
			if (!target.nextSibling) {
				target.parentNode.appendChild(document.createTextNode(''));
			}

			return target.nextSibling;

		}

		// If it should come before
		return target;

	};

	/**
	 * Create a validation error message node
	 * @param  {Node} field      The field
	 * @param  {Object} settings The plugin settings
	 * @return {Node}            The error message node
	 */
	var createError = function (field, settings) {

		// Create the error message
		var error = document.createElement('div');
		error.className = settings.errorClass;
		error.id = settings.errorPrefix + getFieldID(field, settings, true);

		// If the field is a radio button or checkbox, grab the last field label
		var fieldTarget = getErrorField(field);

		// Inject the error message into the DOM
		var location = getErrorLocation(field, fieldTarget, settings);
		location.parentNode.insertBefore(error, location);

		return error;

	};

	/**
	 * Get the error message test
	 * @param  {Node}            field    The field to get an error message for
	 * @param  {Object}          errors   The errors on the field
	 * @param  {Object}          settings The plugin settings
	 * @return {String|Function}          The error message
	 */
	var getErrorMessage = function (field, errors, settings) {

		// Variables
		var messages = settings.messages;

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
			var custom = field.getAttribute(settings.messageCustom);
			if (custom) return custom;
			return messages.patternMismatch[field.type] || messages.patternMismatch.default;
		}

		// Custom validations
		for (var test in settings.customValidations) {
			if (settings.customValidations.hasOwnProperty(test)) {
				if (errors[test] && messages[test]) return messages[test];
			}
		}

		// Fallback error message
		return messages.fallback;

	};

	/**
	 * Add error attributes to a field
	 * @param  {Node}   field    The field with the error message
	 * @param  {Node}   error    The error message
	 * @param  {Object} settings The plugin settings
	 */
	var addErrorAttributes = function (field, error, settings) {
		field.classList.add(settings.fieldClass);
		field.setAttribute('aria-describedby', error.id);
		field.setAttribute('aria-invalid', true);
	};

	/**
	 * Show error attributes on a field or radio/checkbox group
	 * @param  {Node}   field    The field with the error message
	 * @param  {Node}   error    The error message
	 * @param  {Object} settings The plugin settings
	 */
	var showErrorAttributes = function (field, error, settings) {

		// If field is a radio button, add attributes to every button in the group
		if (field.type === 'radio' && field.name) {
			Array.prototype.forEach.call(document.querySelectorAll('[name="' + field.name + '"]'), (function (button) {
				addErrorAttributes(button, error, settings);
			}));
		}

		// Otherwise, add an error class and aria attribute to the field
		addErrorAttributes(field, error, settings);

	};

	/**
	 * Show an error message in the DOM
	 * @param  {Node} field      The field to show an error message for
	 * @param  {Object}          errors   The errors on the field
	 * @param  {Object}          settings The plugin settings
	 */
	var showError = function (field, errors, settings) {

		// Get/create an error message
		var error = field.form.querySelector('#' + escapeCharacters(settings.errorPrefix + getFieldID(field, settings))) || createError(field, settings);
		var msg = getErrorMessage(field, errors, settings);
		error.textContent = typeof msg === 'function' ? msg(field, settings) : msg;

		// Add error attributes
		showErrorAttributes(field, error, settings);

		// Emit custom event
		if (settings.emitEvents) {
			emitEvent(field, 'bouncerShowError', {
				errors: errors
			});
		}

	};

	/**
	 * Remove error attributes from a field
	 * @param  {Node}   field    The field with the error message
	 * @param  {Node}   error    The error message
	 * @param  {Object} settings The plugin settings
	 */
	var removeAttributes = function (field, settings) {
		field.classList.remove(settings.fieldClass);
		field.removeAttribute('aria-describedby');
		field.removeAttribute('aria-invalid');
	};

	/**
	 * Remove error attributes from the field or radio group
	 * @param  {Node}   field    The field with the error message
	 * @param  {Node}   error    The error message
	 * @param  {Object} settings The plugin settings
	 */
	var removeErrorAttributes = function (field, settings) {

		// If field is a radio button, remove attributes from every button in the group
		if (field.type === 'radio' && field.name) {
			Array.prototype.forEach.call(document.querySelectorAll('[name="' + field.name + '"]'), (function (button) {
				removeAttributes(button, settings);
			}));
			return;
		}

		// Otherwise, add an error class and aria attribute to the field
		removeAttributes(field, settings);

	};

	/**
	 * Remove an error message from the DOM
	 * @param  {Node} field      The field with the error message
	 * @param  {Object} settings The plugin settings
	 */
	var removeError = function (field, settings) {

		// Get the error message for this field
		var error = field.form.querySelector('#' + escapeCharacters(settings.errorPrefix + getFieldID(field, settings)));
		if (!error) return;

		// Remove the error
		error.parentNode.removeChild(error);

		// Remove error and a11y from the field
		removeErrorAttributes(field, settings);

		// Emit custom event
		if (settings.emitEvents) {
			emitEvent(field, 'bouncerRemoveError');
		}

	};

	/**
	 * Remove errors from all fields
	 * @param  {String} selector The selector for the form
	 * @param  {Object} settings The plugin settings
	 */
	var removeAllErrors = function (selector, settings) {
		forEach(document.querySelectorAll(selector), (function (form) {
			forEach(form.querySelectorAll('input, select, textarea'), (function (field) {
				removeError(field, settings);
			}));
		}));
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

		/**
		 * Validate a field
		 * @param  {Node} field     The field to validate
		 * @param  {Object} options Validation options
		 * @return {Object}         The validity state and errors
		 */
		publicAPIs.validate = function (field, options) {

			// Don't validate submits, buttons, file and reset inputs, and disabled and readonly fields
			if (field.disabled || field.readOnly || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

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

		/**
		 * Validate all fields in a form or section
		 * @param  {Node} target The form or section to validate fields in
		 * @return {Array}       An array of fields with errors
		 */
		publicAPIs.validateAll = function (target) {
			return Array.prototype.filter.call(target.querySelectorAll('input, select, textarea'), (function (field) {
				var validate = publicAPIs.validate(field);
				return validate && !validate.valid;
			}));
		};

		/**
		 * Run a validation on field blur
		 */
		var blurHandler = function (event) {

			// Only run if the field is in a form to be validated
			if (!event.target.form || !event.target.form.matches(selector)) return;

			// Validate the field
			publicAPIs.validate(event.target);

		};

		/**
		 * Run a validation on a fields with errors when the value changes
		 */
		var inputHandler = function (event) {

			// Only run if the field is in a form to be validated
			if (!event.target.form || !event.target.form.matches(selector)) return;

			// Only run on fields with errors
			if (!event.target.classList.contains(settings.fieldClass)) return;

			// Validate the field
			publicAPIs.validate(event.target);

		};

		/**
		 * Validate an entire form when it's submitted
		 */
		var submitHandler = function (event) {

			// Only run on matching elements
			if (!event.target.matches(selector)) return;

			// Prevent form submission
			event.preventDefault();

			// Validate each field
			var errors = publicAPIs.validateAll(event.target);

			// If there are errors, focus on the first one
			if (errors.length > 0) {
				errors[0].focus();
				emitEvent(event.target, 'bouncerFormInvalid', {errors: errors});
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

		/**
		 * Destroy the current plugin instantiation
		 */
		publicAPIs.destroy = function () {

			// Remove event listeners
			document.removeEventListener('blur', blurHandler, true);
			document.removeEventListener('input', inputHandler, false);
			document.removeEventListener('click', inputHandler, false);
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

		/**
		 * Instantiate a new instance of the plugin
		 */
		var init = function () {

			// Create settings
			settings = extend(defaults, options || {});

			// Add novalidate attribute
			addNoValidate(selector);

			// Event Listeners
			document.addEventListener('blur', blurHandler, true);
			document.addEventListener('input', inputHandler, false);
			document.addEventListener('click', inputHandler, false);
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

}));