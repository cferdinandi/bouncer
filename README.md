# Bouncer.js [![Build Status](https://travis-ci.org/cferdinandi/bouncer.svg)](https://travis-ci.org/cferdinandi/bouncer)
A lightweight form validation script that augments native HTML5 form validation elements and attributes.

**[View the Demo on CodePen &rarr;](https://codepen.io/cferdinandi/pen/ywMdKp)**

[Getting Started](#getting-started) | [Form Validation Attributes](#form-validation-attributes) | [Error Styling](#error-styling) | [Error Types](#error-types) | [Custom Validations](#custom-validation-types) | [Error Location](#error-message-location) | [API](#api) | [Browser Compatibility](#browser-compatibility) | [License](#license) |

**Features:**

- Fields validate on blur (as the user moves out of them), which data shows is the best time for cognitive load.
- The entire form is validated on submit.
- Fields with errors are revalidated as the user types. Errors are removed the instant the field is valid.
- Supports custom validation patterns and error messages.


<hr>

### Want to learn how to write your own vanilla JS plugins? Check out my [Vanilla JS Pocket Guides](https://vanillajsguides.com/) or join the [Vanilla JS Academy](https://vanillajsacademy.com) and level-up as a web developer. 🚀

<hr>


## Getting Started

Compiled and production-ready code can be found in the `dist` directory. The `src` directory contains development code.

### 1. Include Bouncer on your site.

There are two versions of Bouncer: the standalone version, and one that comes preloaded with polyfills for `closest()`, `matches()`, `classList`, and `CustomEvent()`, which are only supported in newer browsers.

If you're including your own polyfills or don't want to enable this feature for older browsers, use the standalone version. Otherwise, use the version with polyfills.

**Direct Download**

You can [download the files directly from GitHub](https://github.com/cferdinandi/bouncer/archive/master.zip).

```html
<script src="path/to/bouncer.polyfills.min.js"></script>
```

**CDN**

You can also use the [jsDelivr CDN](https://cdn.jsdelivr.net/gh/cferdinandi/bouncer/dist/). I recommend linking to a specific version number or version range to prevent major updates from breaking your site. Smooth Scroll uses semantic versioning.

```html
<!-- Always get the latest version -->
<!-- Not recommended for production sites! -->
<script src="https://cdn.jsdelivr.net/gh/cferdinandi/bouncer/dist/bouncer.polyfills.min.js"></script>

<!-- Get minor updates and patch fixes within a major version -->
<script src="https://cdn.jsdelivr.net/gh/cferdinandi/bouncer@1/dist/bouncer.polyfills.min.js"></script>

<!-- Get patch fixes within a minor version -->
<script src="https://cdn.jsdelivr.net/gh/cferdinandi/bouncer@1.0/dist/bouncer.polyfills.min.js"></script>

<!-- Get a specific version -->
<script src="https://cdn.jsdelivr.net/gh/cferdinandi/bouncer@1.0.0/dist/bouncer.polyfills.min.js"></script>
```

**NPM**

You can also use NPM (or your favorite package manager).

```bash
npm install formbouncerjs
```

### 2. Add browser-native form validation attributes to your markup.

No special markup needed&mdash;just browser-native validation attributes (like `required`) and input types (like `email` or `number`).

```html
<form>
	<label for="email">Your email address</label>
	<input type="email" name="email" id="email">
	<button>Submit</button>
</form>
```

### 3. Initialize Bouncer.

In the footer of your page, after the content, initialize Bouncer by passing in a selector for the forms that should be validated.

If the form has errors, submission will get blocked until they're corrected. Otherwise, it will submit as normal.

And that's it, you're done. Nice work!

```html
<script>
	var validate = new Bouncer('form');
</script>
```



## Form Validation Attributes

Modern browsers provide built-in form validation.

Bouncer hooks into those native attributes, suppressing the native validation and running its own. If Bouncer fails to load or run, the browser-native validation will run in its place.

### Required fields

Add the `required` attribute to any field that must be filled out or selected.

```html
<input type="text" name="first-name" required>
```

### Special Input Types

You can use special `type` attribute values to indicate specific types of data that should be captured.

```html
<!-- Must be a valid email address -->
<input type="email" name="email">

<!-- Must be a valid URL -->
<input type="url" name="website">

<!-- Must be a number -->
<input type="number" name="age">

<!-- Must be a date in YYYY-MM-DD format (many browsers include a native date picker for this) -->
<input type="date" name="dob">

<!-- Must be a time in 24-hour format (many browsers include a native date picker for this) -->
<input type="time" name="time">

<!-- Must be a month/year in YYYY-MM format (many browsers include a native date picker for this) -->
<input type="month" name="birthday">

<!-- Must be a color in #rrggbb format (many browsers include a native color picker for this) -->
<input type="color" name="color">
```

### Min and Max Values

For numbers that should not go below or exceed a certain value, you can use the `min` and `max` attributes, respectively.

```html
<!-- Cannot exceed 72 -->
<input type="number" max="72" name="answer">

<!-- Cannot be below 37 -->
<input type="number" min="37" name="answer">

<!-- They can also be combined -->
<input type="number" min="37" max="72" name="answer">
```

### Min and Max Length

For inputs that should not be shorter or longer than a certain number of characters, you can use the `minlength` and `maxlength` attributes, respectively.

```html
<!-- Cannot be shorter than 12 characters -->
<input type="password" minlength="12" name="password">

<!-- Cannot be longer than 24 characters -->
<input type="text" maxlength="24" name="first-name">

<!-- They can also be combined -->
<input type="text" minlength="7" maxlength="24" name="favorite-pixar-character">
```

### Custom Validation Patterns

You can use your own validation pattern for a field with the `pattern` attribute. This uses regular expressions.

```html
<!-- Phone number be in 555-555-5555 format -->
<input type="text" name="tel" pattern="\d{3}[\-]\d{3}[\-]\d{4}">
```

### Custom Pattern Mismatch Error Messages

Show custom errors for pattern mismatches by adding the `[data-bouncer-message]` attribute to the field and setting it to a string value.

```html
<!-- Phone number be in 555-555-5555 format -->
<input type="text" name="tel" pattern="\d{3}[\-]\d{3}[\-]\d{4}" data-bouncer-message="Please use the following format: 555-555-5555">
```

### Custom Error Messages

Show field-specific custom messages for any validation errors by adding the `[data-bouncer-message-*]` attributes to the input.

* `data-bouncer-message-missing-value`
* `data-bouncer-message-out-of-range` (used for both over and under)
* `data-bouncer-message-out-of-range-over`
* `data-bouncer-message-out-of-range-under`
* `data-bouncer-message-wrong-length` (used for both over and under)
* `data-bouncer-message-wrong-length-over`
* `data-bouncer-message-wrong-length-under`
* `data-bouncer-message-pattern-mismatch` (or `data-bouncer-message` for compatibility)

```html
<!-- Age must be between 13 and 65 yrs. -->
<input type="number" name="age" min="13" max="65" required
	data-bouncer-message-missing-value="You must provide your age"
	data-bouncer-message-out-of-range-over="You are too old."
	data-bouncer-message-out-of-range-under="You are too young.">
```


## Error Styling

Bouncer does not come pre-packaged with any styles for fields with errors or error messages. Use the `.error` class to style fields, and the `.error-message` class to style error messages.

Need a starting point? Here's some really lightweight CSS you can use.

```css
/**
 * Form Validation Errors
 */
.error {
	border-color: red;
}

.error-message {
	color: red;
	font-style: italic;
	margin-bottom: 1em;
}
```



## Error Types

Bouncer captures four different types of field errors:

- **`missingValue`** errors occur when a `required` field has no value (or for checkboxes and radio buttons, nothing is selected).
- **`patternMismatch`** errors occur when a value doesn't match the expected pattern for a particular input type, or a pattern provided by the `pattern` attribute.
- **`outOfRange`** errors occur when a number is above or below the `min` or `max` values.
- **`wrongLength`** errors occur when the input is longer or shorter than the `minlength` and `maxlength` values.

The patterns and messages associated with these types of errors can be customized.



## Custom Validation Types

You can add custom validation types to Bouncer beyond the four standard validations.

You can see this feature in action with the *Confirm Password* field on [the demo page](http://cferdinandi.github.io/bouncer/), and view examples of custom validations in the Cookbook (*coming soon*).

### Adding custom validations

Pass in a `customValidations` object as an option when instantiating a new Bouncer instance. Each property in the object is a new validation type. Each value should be a function that accepts two arguments: the field being validated and the settings for the current instantiation.

The function should *check if the field has an error*. Return `true` if there's an error, and `false` when there's not.

```js
var validate = new Bouncer('form', {
	customValidations: {
		isHello: function (field) {

			// Return false because there is NO error
			if (field.value === 'hello') return false;

			// Return true when there is
			return true;

		}
	}
});
```

### Creating custom validation error messages

Add an error message for the custom validation by including the `messages` object in your options.

The key should be the same as your custom validation. It's value can be a string, or a function that returns a string. Message functions can accept two arguments: the field being validated and the settings for the current instantiation.

```js
var validate = new Bouncer('form', {
	customValidations: {
		isHello: function (field) {

			// Return false because there is NO error
			if (field.value === 'hello') return false;

			// Return true when there is
			return true;

		}
	},
	messages: {
		// As a string
		isHello: 'This field should have a value of "hello"',

		// As a function
		isHello: function () {
			return 'This field should have a value of "hello"';
		}
	}
});
```

## Error Message Location

By default, bouncer will render error messages after the invalid field (or the label for it, if the field is a `radio` or `checkbox`).

You can optionally render error messages *before* the field by setting the `messageAfterField` option to `false`.

```js
var validate = new Bouncer('form', {
	messageAfterField: false
});
```

You can also assign a custom location for an error message by including the `[data-bouncer-target]` attribute on a field. Use a selector for where the message should go as its value.

```html
<label for="email">Your Email Address</label>
<input type="email" name="email" id="email" data-bouncer-target="#email-error">
<p><strong>Why do we need this?</strong> We'll use your email address to send you account information.</p>
<div id="email-error"></div>
```



## API

Bouncer includes smart defaults and works right out of the box.

But if you want to customize things, it also has a robust API that provides multiple ways for you to adjust the default options and settings.

### Options and Settings

You can customize validation patterns, error messages, and more by passing and options object into Bouncer during instantiation.

```js
var validate = new Bouncer('form', {

	// Classes & IDs
	fieldClass: 'error', // Applied to fields with errors
	errorClass: 'error-message', // Applied to the error message for invalid fields
	fieldPrefix: 'bouncer-field_', // If a field doesn't have a name or ID, one is generated with this prefix
	errorPrefix: 'bouncer-error_', // Prefix used for error message IDs

	// Patterns
	// Validation patterns for specific input types
	patterns: {
		email: /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*(\.\w{2,})+$/,
		url: /^(?:(?:https?|HTTPS?|ftp|FTP):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/,
		number: /[-+]?[0-9]*[.,]?[0-9]+/,
		color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
		date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))/,
		time: /(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9])/,
		month: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2]))/
	},

	// Message Settings
	messageAfterField: true, // If true, displays error message below field. If false, displays it above.
	messageCustom: 'data-bouncer-message', // The data attribute to use for customer error messages
	messageTarget: 'data-bouncer-target', // The data attribute to pass in a custom selector for the field error location

	// Error messages by error type
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
	disableSubmit: false, // If true, native form submission is suppressed even when form validates

	// Custom Events
	emitEvents: true // If true, emits custom events

});
```

### Custom Events

Bouncer emits five custom events:

- `bouncerShowError` is emitted on a field when an error is displayed for it.
- `bouncerRemoveError` is emitted on a field when an error is removed from it.
- `bouncerFormValid` is emitted on a form is successfully validated.
- `bouncerFormInvalid` is emitted on a form that fails validation.
- `bouncerInitialized` is emitted when bouncer initializes.
- `bouncerDestroy` is emitted when bouncer is destroyed.

You can listen for these events with `addEventListener`. All five events bubble up the DOM. The `event.target` is the field or form (or document, when initializing and destroying).

```js
// Detect show error events
document.addEventListener('bouncerShowError', function (event) {

	// The field with the error
	var field = event.target;

}, false);

// Detect a successful form validation
document.addEventListener('bouncerFormValid', function (event) {

	// The successfully validated form
	var form = event.target;

	// If `disableSubmit` is true, you might use this to submit the form with Ajax

}, false);
```

The `event.detail` object holds event-specific information:

- On the `bouncerShowError` event, it has the specific errors for the field.
- On the `bouncerInitialized` and `bouncerDestroyed` events , it contains the `settings` for the instantiation.
- On the `bouncerFormInvalid` event, it includes all of the fields with errors under `event.detail`.

```js
// Detect show error events
document.addEventListener('bouncerShowError', function (event) {

	// The field with the error
	var field = event.target;

	// The error details
	var errors = event.details.errors;

}, false);
```

### Using Bouncer methods in your own scripts

Bouncer exposes a few public methods that you can use in your own scripts.

#### `validate()`

Validate a field. Pass in the field as an argument. Returns an object with validity data.

```js
// Get a field
var field = document.querySelector('#email');

// Validate the field
var bouncer = new Bouncer();
var isValid = bouncer.validate(field);

// Returns an object
isValid = {

	// If true, field is valid
	valid: false,

	// The specific errors
	errors: {
		missingValue: true,
		patternMismatch: true,
		outOfRange: true,
		wrongLength: true
	}

};

// You can also pass in custom options
bouncer.validate(field, {
	// ...
});
```

#### `validateAll()`

Validate all fields in a form or fieldset. Pass in the section as an argument. Returns an array of fields with errors.

```js
// Get a fieldset
var fieldset = document.querySelector('#fieldset');

// Validate the field
var bouncer = new Bouncer();
var areValid = bouncer.validateAll(fieldset);
```

#### `destroy()`

Destroys an instantiated Bouncer instance. Removes any errors from the form and turns validation back over to the browser-native APIs.

```js
// An bouncer instance
var bouncer = new Bouncer('form');

// Destroy it
bouncer.destroy();
```



## Browser Compatibility

Bouncer works in all modern browsers, and IE 9 and above.

Bouncer is built with modern JavaScript APIs, and uses progressive enhancement. If the JavaScript file fails to load, browser-native form validation runs instead

### Polyfills

Support back to IE9 requires polyfills for `closest()`, `matches()`, `classList`, and `CustomEvent()`. Without them, support starts with Edge.

Use the included polyfills version of Bouncer, or include your own.



## License

The code is available under the [MIT License](LICENSE.md).
