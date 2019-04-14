package com.edgedevstudio.contactus

import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.Uri
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.text.Editable
import android.text.TextUtils
import android.text.TextWatcher
import android.util.Log
import android.util.Patterns
import android.view.Gravity
import android.view.View
import android.widget.Toast
import com.google.android.material.snackbar.Snackbar
import kotlinx.android.synthetic.main.activity_contact_us.*
import java.net.URLEncoder
import java.util.*

class ContactUsActivity : AppCompatActivity(), HttpGetAsync.PostAsyncInterface {

    private val WHEN_NXT_TO_SND_MSG = "contact.us.key"
    private val sheetName = "Contact us Demo"
    private lateinit var tinyDB: TinyDB

    val TAG = "ContactUs"

    override fun onPostExecute(responseCode: Int) {
        tinyDB.putLong(WHEN_NXT_TO_SND_MSG, Date().time + 86400000)
        progress_circular.visibility = View.GONE
        if (responseCode != 200){
            val bool = launchWebSite("fb-messenger://user/220997458532709")
            if (!bool)
                launchWebSite("https://m.me/A1StatusSaver")
        }
        else{
            send_btn.isEnabled = true
            nameInputLayout.visibility = View.GONE
            msgInputLayout.visibility = View.GONE
            emailInputLayout.visibility = View.GONE
            send_btn.visibility = View.GONE
            info_txt_view.visibility = View.VISIBLE
        }
    }

    private fun launchWebSite(urlString: String): Boolean {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(urlString))
        if (intent.resolveActivity(packageManager) != null) {
            try {
                startActivity(intent)
            } catch (e: Exception) {
                return false
            }
            return true
        }

        return false
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_contact_us)

        tinyDB = TinyDB(this)

        val nxt24hrs = tinyDB.getLong(WHEN_NXT_TO_SND_MSG, 0)

        if (Date().time < nxt24hrs) {
            nameInputLayout.visibility = View.GONE
            msgInputLayout.visibility = View.GONE
            emailInputLayout.visibility = View.GONE
            send_btn.visibility = View.GONE
            info_txt_view.visibility = View.VISIBLE

            return
        } else {
            nameInputLayout.visibility = View.VISIBLE
            msgInputLayout.visibility = View.VISIBLE
            emailInputLayout.visibility = View.VISIBLE
            send_btn.visibility = View.VISIBLE
            info_txt_view.visibility = View.GONE
        }

        nameEditText.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                if (s.toString().trim().length < 1) nameInputLayout.error = "This Field is Required"
                else nameInputLayout.error = ""
            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {

            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {

            }

        })

        emailEditText.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                if (s.toString().trim().length < 5) emailInputLayout.error = "This Field is Required"
                else {
                    val isValid = isEmailValid(s.toString().trim())
                    if (!isValid) {
                        emailInputLayout.error = "This Field is Required"
                    } else emailInputLayout.error = ""
                }
            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        msgEditText.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                if (s.toString().trim().length < 10) msgInputLayout.error = "This Field is Required"
                else msgInputLayout.error = ""
            }

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {

            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {

            }

        })


    }

    private fun isEmailValid(target: CharSequence): Boolean =
        (!TextUtils.isEmpty(target) && Patterns.EMAIL_ADDRESS.matcher(target).matches())

    fun isConnectedToInternet(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val activeNetwork = connectivityManager.activeNetworkInfo
        if (activeNetwork != null)
            return activeNetwork.isConnected
        else
            return false
    }

    fun sendMsg(view: View) {

        val name = nameEditText.text.toString().trim()
        val email = emailEditText.text.toString().trim()
        val msg = msgEditText.text.toString().trim()

        if (name.length < 2) {
            nameInputLayout.error = "This Field is Required"
            return
        }
        if (email.length < 5 || !isEmailValid(email)) {
            emailInputLayout.error ="This Field is Required"
            return
        }

        if (msg.length < 5) {
            msgInputLayout.error = "This Field is Required"
            return
        }
        if (!isConnectedToInternet()) {
            val toasty= Toast.makeText(this, "Turn on your Internet", Toast.LENGTH_LONG)
            toasty.setGravity( Gravity.CENTER_HORIZONTAL or Gravity.CENTER_VERTICAL, 0, 0)
            toasty.show()
            Snackbar.make(view, "Turn on your Internet", Snackbar.LENGTH_LONG).show()
            return
        }

        val builder = Uri.Builder()
        builder.scheme("https")
            .authority("script.google.com")
            .appendPath("macros")
            .appendPath("s")
            .appendPath("AKfycbz-vEBhVACujXI5Srf8OAnfryMuOZv4U2l9KIS44fZt0vcMSZY")
            .appendPath("exec")
            .appendQueryParameter("name", name)
            .appendQueryParameter("email", email)
            .appendQueryParameter("lang", Locale.getDefault().getLanguage())
            .appendQueryParameter("sn", sheetName)

        val urlStr = builder.build().toString() + "&msg=${URLEncoder.encode(msg, "UTF-8")}"
        Log.d(TAG, urlStr)

        send_btn.isEnabled = false
        progress_circular.visibility = View.VISIBLE
        HttpGetAsync(urlStr, this).execute()
    }
}
