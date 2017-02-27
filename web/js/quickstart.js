lbry.quickstartForm = function (selector, apiUrl) {
  var form = $(selector),
    accessToken = form.find(':input[name="access_token"]').val(),
    walletAddressInput = form.find(':input[name="wallet_address"]'),
    transactionHashInput = form.find(':input[name="transaction_hash"]'),
    storageKey = form.attr('id') + "SuccessHTML",
    submitButton = form.find(':input[type="submit"]'),
    isAutomaticSubmit = false,
    isSubmitting = false;

  function resetFormState() {
    isSubmitting = false;
    walletAddressInput.attr('readonly', null);
    transactionHashInput.attr('readonly', null);
    submitButton.val(submitButton.data('submitLabel')).attr('disabled', null);
  }

  if (window.localStorage.getItem(storageKey)) {
    form.find('.notice-success').html(window.localStorage.getItem(storageKey)).show();
    form.find('.form-row, .submit-row').hide();
  } else if (accessToken) {
    form.submit(function (event) {
      if (isSubmitting) {
        return false;
      }

      var postData =  {
        access_token: accessToken,
        wallet_address: walletAddressInput.val()
      };

      form.find('.notice-success, .notice-error').hide();

      if (!walletAddressInput.val()) {
        resetFormState();
        if (!isAutomaticSubmit) {
          form.find('.notice-error').html("Please supply a wallet address.").show();
        }
        return false;
      }

      if (transactionHashInput.length) {
        if (!transactionHashInput.val()) {
          resetFormState();
          if (!isAutomaticSubmit) {
            form.find('.notice-error').html("Please supply a transaction ID.").show();
          }
          return false;
        }
        postData.transaction_hash = transactionHashInput.val();
      }

      event.preventDefault();

      walletAddressInput.attr('readonly', 'readonly');
      transactionHashInput.attr('readonly', 'readonly');
      submitButton.val(submitButton.data('submittingLabel')).attr('disabled', 'disabled');

      $.post(apiUrl, postData)
        .done(function (responseData) {
          var data = responseData.data;
          var anchor = $('<a class="link-primary"></a>');
          anchor.attr("href", "https://explorer.lbry.io/tx/" + data.TransactionHash);
          anchor.html(data.TransactionHash)
          form.find('.notice-success')
            .html(data.RewardAmount + " credits sent in transaction ")
            .append(anchor)
            .show();
          window.localStorage.setItem(storageKey, form.find('.notice-success').html());
        })
        .fail(function (xhr) {
          var responseData = $.parseJSON(xhr.responseText);
          form.find('.notice-error').html(responseData.error.length ? responseData.error : "Something went wrong. Please email grin@lbry.io").show();
        })
        .always(resetFormState);
    })

    isAutomaticSubmit = true;
    form.submit();
    isAutomaticSubmit = false;
  }
}