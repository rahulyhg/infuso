<? tmp::header();

tmp::param("title","Ошибка 404: страница не найдена");

<div style='padding:100px;' >
    <div style='font-size:100px;' >404</div>
    echo mod_url::current();
    <img src='/admin/res/logo.gif' />
</div>

tmp::footer();