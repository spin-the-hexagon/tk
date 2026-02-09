#[cfg(windows)]
use std::ffi::CStr;
use std::{
    ffi::{CString, c_char},
    iter,
    mem::forget,
    ptr,
    str::FromStr,
};

use eyre::Result;

#[cfg(windows)]
use windows::Win32::Security::Credentials::{
    CRED_FLAGS_REQUIRE_CONFIRMATION, CRED_TYPE_GENERIC, CREDENTIALW, CredReadW,
};
use windows::core::HSTRING;

#[cfg(windows)]
fn read_credential_internal(cred_id: String) -> Result<String> {
    let mut cred = CREDENTIALW::default();
    let mut credptr = ptr::from_mut(&mut cred);
    let cred_id_utf16 = cred_id.encode_utf16().collect::<Vec<_>>();

    unsafe {
        use windows::core::PCWSTR;

        CredReadW(
            PCWSTR::from_raw(cred_id_utf16.as_ptr()),
            CRED_TYPE_GENERIC,
            None,
            ptr::from_mut(&mut credptr),
        )?
    };

    let cred = unsafe { *credptr };
    let blob = unsafe {
        std::slice::from_raw_parts(cred.CredentialBlob, cred.CredentialBlobSize as usize)
    };

    let value = String::from_utf8_lossy(blob).to_string();

    Ok(value)
}

#[unsafe(no_mangle)]
pub extern "C" fn read_credential(inp: *const c_char) -> *const c_char {
    let mut str = String::from("INVALID");

    #[cfg(windows)]
    if let Ok(token) =
        read_credential_internal(unsafe { CStr::from_ptr(inp).to_string_lossy().to_string() })
    {
        str = token;
    }

    let str = CString::from_str(&str).unwrap();

    let ptr = str.as_ptr();

    forget(str);

    return ptr;
}

#[unsafe(no_mangle)]
pub extern "C" fn free_str(cstr: *mut c_char) {
    unsafe {
        std::mem::drop(CString::from_raw(cstr));
    }
}
