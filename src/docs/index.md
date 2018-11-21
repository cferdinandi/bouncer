<form data-validate>
	<div>
		<label for="color">Color Picker <span class="pattern color">7-Character Hexadecimal (ex. #f7f7f7)</span></label>
		<input type="color" name="color" id="color" value="" pattern="#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})" required>
	</div>

	<div>
		<label for="date">Date <span class="pattern date">YYYY-MM-DD</span></label>
		<input type="date" name="date" id="date" value="" required>
	</div>

	<div>
		<label for="time">Time <span class="pattern time">HH:MM (24-hour time)</span></label>
		<input type="time" name="time" id="time" value="" required>
	</div>

	<div>
		<label for="month">Month <span class="pattern month">YYYY-MM</span></label>
		<input type="month" name="month" id="month" value="" required>
	</div>

	<div>
		<!-- Regex: https://gist.github.com/badsyntax/719800 -->
		<label for="email">Email</label>
		<input type="email" name="email" id="email" value="" data-bouncer-message="The domain portion of the email address is invalid (the portion after the @)." required>
	</div>

	<div>
		<!-- Regex: https://gist.github.com/dperini/729294 -->
		<label for="url">URL</label>
		<input type="url" name="url" id="url" value="" data-bouncer-message="The URL is a missing a TLD (for example, .com)." required>
	</div>

	<div>
		<!-- Regex: https://gist.github.com/dperini/729294 -->
		<label for="urlnotld">URL without TLD allowed</label>
		<input type="url" name="urlnotld" id="urlnotld" value="" pattern="(?:(?:https?|HTTPS?|ftp|FTP):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)*)(?::\d{2,5})?(?:[\/?#]\S*)?" required>
	</div>

	<div>
		<label for="number">Number</label>
		<input type="number" name="number" id="number" value="" required>
	</div>

	<div>
		<label for="float">Number (no decimals)</label>
		<input type="number" step="any" name="integer" id="integer" value="" pattern="^(?:[-+]?[0-9]*)$" required>
	</div>

	<div>
		<label for="numberminmax">Number with Min and Max <span class="pattern">Must be between 2 and 7</span></label>
		<input type="number" min="2" max="7" name="numberminmax" id="numberminmax" value="" required>
	</div>

	<div>
		<label for="tel">Tel <span class="pattern">123-456-7890</span></label>
		<input type="text" name="tel" id="tel" value="" pattern="^(?:\d{3}[\-]\d{3}[\-]\d{4})$" required>
	</div>

	<div>
		<label for="password">Password <span class="pattern">At least 1 uppercase character, 1 lowercase character, and 1 number</span></label>
		<input type="password" name="password" id="password" value="" data-bouncer-message="Please choose a password that includes at least 1 uppercase character, 1 lowercase character, and 1 number." pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*" required>
	</div>

	<div>
		<label for="textminmax">Text with MinLength and MaxLength <span class="pattern">must be between 3 and 9 characters long</span></label>
		<input type="text" minlength="3" maxlength="9" name="textminmax" id="textminmax" value="" required>
	</div>

	<div>
		<label for="select">Select</label>
		<select name="select" id="select" required>
			<option></option>
			<option>Harry Potter</option>
			<option>Lord of the Rings</option>
			<option>Star Wars</option>
			<option>Start Trek</option>
		</select>
	</div>

	<div>
		<strong>Radio Buttons</strong>
		<label class="label-normal">
			<input type="radio" name="radio" id="radio-1" required>
			Yes
		</label>
		<label class="label-normal">
			<input type="radio" name="radio" id="radio-2" required>
			No
		</label>
	</div>

	<div>
		<strong>Checkboxes</strong>
		<label class="label-normal">
			<input type="checkbox" name="checkbox-1" id="checkbox-1" required>
			Wolverine (must be checked)
		</label>
		<label class="label-normal">
			<input type="checkbox" name="checkbox-2" id="checkbox-2">
			Storm
		</label>
		<label class="label-normal">
			<input type="checkbox" name="checkbox-3" id="checkbox-3">
			Cyclops
		</label>
		<label class="label-normal">
			<input type="checkbox" name="checkbox-4" id="checkbox-4">
			Gambit
		</label>
	</div>

	<input type="submit" class="button" value="Submit">
</form>