/*!
 * formbouncerjs v1.4.6
 * A lightweight form validation script that augments native HTML5 form validation elements and attributes.
 * (c) 2021 Chris Ferdinandi
 * MIT License
 * http://github.com/cferdinandi/bouncer
 */

/*  Bouncer ES6 Class
 *  ported by Kristof Zerbe: https://github.com/kristofzerbe/bouncer
 */
class Bouncer {

    constructor(selector, options) {

        this.selector = selector;
		this.targets = document.querySelectorAll(this.selector);

        // Create settings
        this.settings = this.extend(this.defaults(), options || {});

        // Expose public methods 
        this.validate = this.validate;
        this.validateAll = this.validateAll;
        this.destroy = this.destroy;

        this.init();
    }

    init() {
        // Add novalidate attribute
        this.addNoValidate();

        // Event Listeners
        document.addEventListener('blur', this.blurHandler.bind(this), true);
        document.addEventListener('input', this.inputHandler.bind(this), false);
        document.addEventListener('click', this.inputHandler.bind(this), false);
        document.addEventListener('submit', this.submitHandler.bind(this), false);

        // Emit custom event
        if (this.settings.emitEvents) {
            this.emitEvent(document, 'bouncerInitialized', {
                settings: this.settings
            });
        }
    }

    defaults() {
        return {

            // Classes & IDs
            fieldClass: 'error',
			errorTag: 'div',
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
    }

    /**
     * Run a validation on field blur
     */
     blurHandler(event) {

        // Only run if the field is in a form to be validated
        if (!event.target.form || !event.target.form.matches(this.selector)) return;

        // Validate the field
        this.validate(event.target);

		// Validate complete form silently, to see if it's valid and emit appropriate event
		const errors = this.validateAll(event.target.form, true);
		if (errors.length > 0) {
			this.emitEvent(event.target, 'bouncerFormInvalid', { 
                errors: errors,
				form: event.target.form
            });
		} else {
			this.emitEvent(event.target, 'bouncerFormValid', { 
				form: event.target.form 
			});
		}
		
    };

    /**
     * Run a validation on a fields with errors when the value changes
     */
    inputHandler(event) {

        // Only run if the field is in a form to be validated
        if (!event.target.form || !event.target.form.matches(this.selector)) return;

        // Only run on fields with errors
        if (!event.target.classList.contains(this.settings.fieldClass)) return;

        // Validate the field
        this.validate(event.target);

		// Validate complete form silently, to see if it's valid and emit appropriate event
		const errors = this.validateAll(event.target.form, true);
		if (errors.length > 0) {
			this.emitEvent(event.target, 'bouncerFormInvalid', { 
				errors: errors,
				form: event.target.form
			});
		} else {
			this.emitEvent(event.target, 'bouncerFormValid', { 
				form: event.target.form 
			});
		}
		
	};

    /**
     * Validate an entire form when it's submitted
     */
    submitHandler(event) {

        // Only run on matching elements
        if (!event.target.matches(this.selector)) return;

        // Prevent form submission
        event.preventDefault();

        // Validate each field
        const errors = this.validateAll(event.target);

        // If there are errors, focus on the first one
        if (errors.length > 0) {
            errors[0].focus();
            this.emitEvent(event.target, 'bouncerFormInvalid', { 
                errors: errors 
            });
            return;
        }

        // Otherwise, submit if not disabled
        if (!this.settings.disableSubmit) {
            event.target.submit();
        }

        // Emit custom event
        if (this.settings.emitEvents) {
            this.emitEvent(event.target, 'bouncerFormValid', { 
				form: event.target
			});
        }
    };

    /**
     * Validate a field
     * @param  {Node}    field     The field to validate
     * @param  {Object}  options   Validation options
     * @param  {boolean} silent    Check silently, no error messages are shown
     * @return {Object}            The validity state and errors
     */
    validate(field, options, silent) {

        // Don't validate submits, buttons, file and reset inputs, and disabled and readonly fields
        if (field.disabled || field.readOnly || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

        // Local settings
        const _settings = this.extend(this.settings, options || {});

        // Check for errors
        const isValid = this.getErrors(field, _settings);

        // If valid, remove any error messages
        if (isValid.valid) {
            this.removeError(field, _settings);
            return isValid;
        }

        // Otherwise, show an error message
        if (!silent) {
			this.showError(field, isValid.errors, _settings);
		}

        return isValid;
    };

    /**
     * Validate all fields in a form or section
     * @param  {Node} 	 target The form(s) or section(s) to validate fields in, if 'undefined' initialized targets will be used
     * @param  {boolean} silent Check silently, no error messages are shown
     * @return {Array}   An array of fields with errors
     */
    validateAll(target, silent) {
        const self = this;

		if (target === undefined) { // target is not provided: take initialized targets (Nodelist)
			target = this.targets;
		} else { 
			if (typeof target === "string") { // target is as string selector: get Elements (Nodelist)
				target = document.querySelectorAll(target);
			}
			if (target instanceof Element) { // target is an Element: create array with element for iteration
				let n = [];
				n.push(target);
				target = n;
			}
		}

		let ret = [];
		this.forEach(target, function(t) {
			let elements = Array.prototype.filter.call(
				t.querySelectorAll('input, select, textarea'), 
				function (field) {
					const validate = self.validate(field, null, silent);
					return validate && !validate.valid;
				}
			);
			ret.push(...elements);
		});

        return ret;
    };

    destroy() {

        // Remove event listeners
        document.removeEventListener('blur', this.blurHandler, true);
        document.removeEventListener('input', this.inputHandler, false);
        document.removeEventListener('click', this.inputHandler, false);
        document.removeEventListener('submit', this.submitHandler, false);

        // Remove all errors
        this.removeAllErrors();

        // Remove novalidate attribute
        this.removeNoValidate();

        // Emit custom event
        if (this.settings.emitEvents) {
            this.emitEvent(document, 'bouncerDestroyed', {
                settings: this.settings
            });
        }

        // Reset settings
        this.settings = null;
    };

    /**
	 * A wrapper for Array.prototype.forEach() for non-arrays
	 * @param  {Array-like} arr      The array-like object
	 * @param  {Function}   callback The callback to run
	 */
    forEach(arr, callback) {
        Array.prototype.forEach.call(arr, callback);
    }

    /**
	 * Merge two or more objects together.
	 * @param   {Object}   objects  The objects to merge together
	 * @returns {Object}            Merged values of defaults and options
	 */
    extend() {
        const self = this;
        let merged = {};
		this.forEach(arguments, function (obj) {
			for (let key in obj) {
				if (!obj.hasOwnProperty(key)) return;
				if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
					merged[key] = self.extend(merged[key], obj[key]);
				} else {
					merged[key] = obj[key];
				}
			}
		});
		return merged;
    }

    /**
	 * Emit a custom event
	 * @param  {Node}   elem    The element
	 * @param  {String} type    The event type
     * @param  {Object} details The settings object
	 */
    emitEvent(elem, type, details) {
		if (typeof window.CustomEvent !== 'function') return;
		const event = new CustomEvent(type, {
			bubbles: true,
			detail: details || {}
		});
		elem.dispatchEvent(event);
	};

    /**
	 * Add the `novalidate` attribute to all forms
	 * @param {Boolean} remove  If true, remove the `novalidate` attribute
	 */
	addNoValidate() {
		this.forEach(this.targets, function (form) {
			form.setAttribute('novalidate', true);
		});
	};

	/**
	 * Remove the `novalidate` attribute to all forms
	 */
	removeNoValidate() {
		this.forEach(this.targets, function (form) {
			form.removeAttribute('novalidate');
		});
	};

    /**
	 * Check if a required field is missing its value
	 * @param  {Node} field The field to check
	 * @return {Boolean}       It true, field is missing it's value
	 */
    missingValue(field) {

        // If not required, bail
        if (!field.hasAttribute('required')) return false;

        // Handle checkboxes
        if (field.type === 'checkbox') {
            return !field.checked;
        }

        // Get the field value length
        let length = field.value.length;

        // Handle radio buttons
        if (field.type === 'radio') {
            length = Array.prototype.filter.call(
                field.form.querySelectorAll('[name="' + this.escapeCharacters(field.name) + '"]'), 
                function (btn) {
                    return btn.checked;
                }
            ).length;
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
    patternMismatch(field, settings) {

        // Check if there's a pattern to match
        let pattern = field.getAttribute('pattern');
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
    outOfRange(field) {

        // Make sure field has value
        if (!field.value || field.value.length < 1) return false;

        // Check for range
        const max = field.getAttribute('max');
        const min = field.getAttribute('min');

        // Check validity
        const num = parseFloat(field.value);
        if (max && num > max) return 'over';
        if (min && num < min) return 'under';

        return false;
    };

    /**
	 * Check if the field value is too long or too short
	 * @param  {Node}   field    The field to check
	 * @return {String}           Returns 'over', 'under', or false
	 */
	wrongLength(field) {

		// Make sure field has value
		if (!field.value || field.value.length < 1) return false;

		// Check for min/max length
		const max = field.getAttribute('maxlength');
		const min = field.getAttribute('minlength');

		// Check validity
		const length = field.value.length;
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
	runValidations(field, settings) {
		return {
			missingValue: this.missingValue(field),
			patternMismatch: this.patternMismatch(field, settings),
			outOfRange: this.outOfRange(field),
			wrongLength: this.wrongLength(field)
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
	customValidations(field, errors, validations, settings) {
		for (let test in validations) {
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
	hasErrors(errors) {
		for (let type in errors) {
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
	getErrors(field, settings) {

		// Get standard validation errors
		let errors = this.runValidations(field,settings);

		// Check for custom validations
		errors = this.customValidations(field, errors, settings.customValidations, settings);

		return {
			valid: !this.hasErrors(errors),
			errors: errors
		};
	};

	/**
	 * Escape special characters for use with querySelector
	 * @author Mathias Bynens
	 * @link https://github.com/mathiasbynens/CSS.escape
	 * @param {String} id The anchor ID to escape
	 */
	escapeCharacters(id) {

		let string = String(id);
		let length = string.length;
		let index = -1;
		let codeUnit;
		let result = '';
		let firstCodeUnit = string.charCodeAt(0);

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
	getFieldID(field, settings, create) {
		let id = field.name ? field.name : field.id;
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
	getErrorField(field) {

		// If the field is a radio button, get the last item in the radio group
		// @todo if location is before, get first item
		if (field.type === 'radio' && field.name) {
			const group = field.form.querySelectorAll('[name="' + this.escapeCharacters(field.name) + '"]');
			field = group[group.length - 1];
		}

		// Get the associated label for radio button or checkbox
		if (field.type === 'radio' || field.type === 'checkbox') {
			const label = field.closest('label') || field.form.querySelector('[for="' + field.id + '"]');
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
	getErrorLocation(field, target, settings) {

		// Check for a custom error message
		const selector = field.getAttribute(settings.messageTarget);
		if (selector) {
			const location = field.form.querySelector(selector);
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
	createError(field, settings) {

		// Create the error message
		let error = document.createElement(settings.errorTag);
		error.className = settings.errorClass;
		error.id = settings.errorPrefix + this.getFieldID(field, settings, true);

		// If the field is a radio button or checkbox, grab the last field label
		let fieldTarget = this.getErrorField(field);

		// Inject the error message into the DOM
		let location = this.getErrorLocation(field, fieldTarget, settings);
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
	getErrorMessage(field, errors, settings) {

		// Variables
		const messages = settings.messages;

		// Missing value error
		if (errors.missingValue) {
            let msgMissingValue = messages.missingValue[field.type] || messages.missingValue.default;
            
            const customMissingValue = field.getAttribute(settings.messageCustom);
			if (customMissingValue) msgMissingValue = customMissingValue;
            
            return msgMissingValue;
		}

		// Numbers that are out of range
		if (errors.outOfRange) {
            let msgOutOfRange = messages.outOfRange[errors.outOfRange];

            const customOutOfRange = field.getAttribute(settings.messageCustom);
			if (customOutOfRange) msgOutOfRange = customOutOfRange;

			return msgOutOfRange
                .replace('{max}', field.getAttribute('max'))
                .replace('{min}', field.getAttribute('min'))
                .replace('{length}', field.value.length);
		}

		// Values that are too long or short
		if (errors.wrongLength) {
            let msgWrongLength = messages.wrongLength[errors.wrongLength];
            
            const customWrongLength = field.getAttribute(settings.messageCustom);
			if (customWrongLength) msgWrongLength = customWrongLength;
            
            return msgWrongLength
                .replace('{maxLength}', field.getAttribute('maxlength'))
                .replace('{minLength}', field.getAttribute('minlength'))
                .replace('{length}', field.value.length);
		}

		// Pattern mismatch error
		if (errors.patternMismatch) {
            let msgPatternMismatch = messages.patternMismatch[field.type] || messages.patternMismatch.default;
			
            const customPatternMismatch = field.getAttribute(settings.messageCustom);
			if (customPatternMismatch) msgPatternMismatch = customPatternMismatch;
			
            return msgPatternMismatch
		}

		// Custom validations
		for (let test in settings.customValidations) {
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
	addErrorAttributes(field, error, settings) {
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
	showErrorAttributes(field, error, settings) {
        const self = this;

		// If field is a radio button, add attributes to every button in the group
		if (field.type === 'radio' && field.name) {
			Array.prototype.forEach.call(document.querySelectorAll('[name="' + field.name + '"]'), function (button) {
				self.addErrorAttributes(button, error, settings);
			});
		}

		// Otherwise, add an error class and aria attribute to the field
		this.addErrorAttributes(field, error, settings);
	};

    /**
	 * Show an error message in the DOM
	 * @param  {Node} field      The field to show an error message for
	 * @param  {Object}          errors   The errors on the field
	 * @param  {Object}          settings The plugin settings
	 */
	showError(field, errors, settings) {

		// Get/create an error message
		let error = field.form.querySelector('#' + this.escapeCharacters(settings.errorPrefix + this.getFieldID(field, settings))) || this.createError(field, settings);
		let msg = this.getErrorMessage(field, errors, settings);
		error.textContent = typeof msg === 'function' ? msg(field, settings) : msg;

		// Add error attributes
		this.showErrorAttributes(field, error, settings);

		// Emit custom event
		if (settings.emitEvents) {
			this.emitEvent(field, 'bouncerShowError', {
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
	removeAttributes(field, settings) {
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
	removeErrorAttributes(field, settings) {
        const self = this;

		// If field is a radio button, remove attributes from every button in the group
		if (field.type === 'radio' && field.name) {
			Array.prototype.forEach.call(document.querySelectorAll('[name="' + field.name + '"]'), function (button) {
				self.removeAttributes(button, settings);
			});
			return;
		}

		// Otherwise, add an error class and aria attribute to the field
		this.removeAttributes(field, settings);
	};

    /**
	 * Remove an error message from the DOM
	 * @param  {Node} field      The field with the error message
	 * @param  {Object} settings The plugin settings
	 */
	removeError(field, settings) {

		// Get the error message for this field
		let error = field.form.querySelector('#' + this.escapeCharacters(settings.errorPrefix + this.getFieldID(field, settings)));
		if (!error) return;

		// Remove the error
		error.parentNode.removeChild(error);

		// Remove error and a11y from the field
		this.removeErrorAttributes(field, settings);

		// Emit custom event
		if (settings.emitEvents) {
			this.emitEvent(field, 'bouncerRemoveError');
		}

	};

	/**
	 * Remove errors from all fields
	 * @param  {String} selector The selector for the form
	 * @param  {Object} settings The plugin settings
	 */
	removeAllErrors() {
        const self = this;
		this.forEach(self.targets, function (form) {
			self.forEach(form.querySelectorAll('input, select, textarea'), function (field) {
				self.removeError(field, self.settings);
			});
		});
	};

}
export { Bouncer }