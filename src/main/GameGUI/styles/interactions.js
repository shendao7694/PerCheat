module.exports = `
    .tp-tbiv_t {
        font-weight: 500;
        transition: color 0.2s ease, text-shadow 0.2s ease;
    }
    .tp-tbiv.tp-tbiv-sel .tp-tbiv_t {
        color: #8cb4ff;
        text-shadow: 0 0 6px rgba(80,140,255,0.3);
    }
    .tp-tbiv.tp-tbiv-sel {
        border-bottom: 2px solid;
        border-image: linear-gradient(90deg, rgba(80,140,255,0.9), rgba(160,80,255,0.9)) 1;
    }
    .tp-fldv_b {
        transition: background-color 0.15s ease, box-shadow 0.15s ease;
        cursor: pointer;
        border-radius: 2px;
    }
    .tp-fldv_b:hover {
        background: linear-gradient(90deg, rgba(80,140,255,0.08), rgba(160,80,255,0.04));
        box-shadow: inset 0 0 0 1px rgba(80,140,255,0.1);
    }
    .tp-fldv_c {
        padding-left: 0 !important;
        transition: max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
    }
    .tp-tbpv_c {
        padding-left: 0 !important;
        overflow-y: auto;
        flex: 1;
        min-height: 0;
    }
    .tp-btnv_b {
        border-radius: 2px;
        transition: background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
    }
    .tp-btnv_b:hover {
        background: linear-gradient(135deg, rgba(80,140,255,0.35), rgba(160,80,255,0.25));
        box-shadow: 0 0 8px rgba(80,140,255,0.15), inset 0 0 0 1px rgba(80,140,255,0.15);
    }
    .tp-btnv_b:active {
        transform: scale(0.96);
        background: linear-gradient(135deg, rgba(80,140,255,0.45), rgba(160,80,255,0.35));
    }
    .tp-txtv_i {
        border-radius: 2px;
        transition: box-shadow 0.15s ease;
    }
    .tp-txtv_i:focus {
        box-shadow: 0 0 0 1px rgba(80,140,255,0.3), 0 0 6px rgba(80,140,255,0.1);
    }
    .tp-ckbv_w {
        border-radius: 3px;
        transition: box-shadow 0.15s ease;
    }
    .tp-ckbv_w:checked {
        box-shadow: 0 0 4px rgba(80,140,255,0.3);
    }
    .tp-sldv_k {
        border-radius: 3px;
        transition: box-shadow 0.15s ease;
    }
    .tp-sldv_k:hover {
        box-shadow: 0 0 6px rgba(80,140,255,0.25);
    }
    .tp-sldv_t {
        border-radius: 2px;
    }
    .tp-lblv_l {
        transition: color 0.15s ease;
    }
    .tp-lblv_l:hover {
        color: #c0c4e0;
    }
    .tp-grlv_g polyline {
        stroke-width: 1.5;
        filter: drop-shadow(0 0 2px rgba(80,140,255,0.3));
    }
    .tp-sprv_r {
        background: linear-gradient(90deg, transparent, rgba(80,140,255,0.12), rgba(160,80,255,0.08), transparent);
        height: 1px;
    }
    .tp-lstv_s {
        border-radius: 2px;
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.15) transparent;
    }
    .tp-fldv {
        overflow: hidden;
    }
    .tp-fldv_c {
        overflow: hidden;
    }
`;