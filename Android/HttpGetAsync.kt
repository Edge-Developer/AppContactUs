package com.edgedevstudio.contactus

import android.os.AsyncTask
import android.util.Log
import java.net.HttpURLConnection
import java.net.URL

/**
 * Created by Olorunleke Opeyemi on 12/04/2019.
 **/

class HttpGetAsync(val urlStr: String, val postAsyncInterface: PostAsyncInterface) : AsyncTask<Void, Void, Int>() {
    val TAG = "HttpGetAsync"
    override fun doInBackground(vararg params: Void?): Int {
        val url = URL(urlStr)
        val httpConn = url.openConnection() as HttpURLConnection
        val responseCode = httpConn.getResponseCode()
        httpConn.disconnect()

        Log.d(TAG, "STATUS Code: $responseCode")
        return responseCode;
    }

    override fun onPostExecute(responseCode: Int) {
        super.onPostExecute(responseCode)
        postAsyncInterface.onPostExecute(responseCode)
    }

    interface PostAsyncInterface {
        fun onPostExecute(responseCode: Int)
    }
}
